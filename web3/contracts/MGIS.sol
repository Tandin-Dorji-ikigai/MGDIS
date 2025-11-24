// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Mindful Governance – Project Transparency System (PTS)
 * @notice
 *  - Register GMC projects with metadata (budget, sector, agency, contractor, etc.)
 *  - Define milestones with due dates and amounts
 *  - Log completion and approval of milestones on-chain
 *  - Release funds milestone-by-milestone to contractors
 *  - Emit events for BhutanChain indexers / GovAI Watch / dashboards
 *
 *  This is the "Layer 1: PTS" backbone. Your SDGIL + AI layer will read events
 *  and state from this contract to build analytics and dashboards.
 */
contract MindfulProjectTransparency {
    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------

    address public admin; // GMC core authority

    mapping(address => bool) public agencies; // ministries / implementing agencies
    mapping(address => bool) public auditors; // RAA / oversight / GovAI oracle signers

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAgency() {
        require(agencies[msg.sender], "Not agency");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Not auditor");
        _;
    }

    // Simple non-reentrancy guard for fund release
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrancy");
        locked = true;
        _;
        locked = false;
    }

    // -------------------------------------------------------------------------
    // Core Data Structures
    // -------------------------------------------------------------------------

    enum ProjectStatus {
        Registered,
        InProgress,
        Paused,
        Completed,
        Cancelled
    }

    struct Milestone {
        uint256 id;
        string name;
        uint256 amount;    // wei to be released when approved
        uint256 dueDate;   // unix timestamp
        bool isCompleted;  // marked by agency / contractor
        bool isApproved;   // approved by auditor
        uint256 completedAt;
        uint256 approvedAt;
    }

    struct Project {
        uint256 id;
        string name;
        string sector;        // e.g. "Health", "Education", etc.
        address agency;       // implementing agency wallet
        address contractor;   // contractor wallet receiving funds
        uint256 budget;       // total allocated for this project (in wei)
        uint256 createdAt;
        ProjectStatus status;
        uint256 totalReleased;    // sum of all milestone releases
        string metadataURI;       // IPFS or off-chain JSON with GMC metadata
        uint256 milestoneCount;
        bool exists;
    }

    uint256 public projectCounter;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones; // projectId => milestoneId => Milestone

    // -------------------------------------------------------------------------
    // Events – these are what "BhutanChain" / dashboards / GovAI Watch subscribe to
    // -------------------------------------------------------------------------

    event AgencyUpdated(address indexed agency, bool isActive);
    event AuditorUpdated(address indexed auditor, bool isActive);

    event ProjectRegistered(
        uint256 indexed projectId,
        string name,
        string sector,
        address indexed agency,
        address indexed contractor,
        uint256 budget,
        string metadataURI
    );

    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );

    event MilestoneAdded(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        string name,
        uint256 amount,
        uint256 dueDate
    );

    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed markedBy,
        uint256 completedAt
    );

    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed approvedBy,
        uint256 approvedAt
    );

    event FundsReleased(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed contractor,
        uint256 amount
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        admin = msg.sender;
    }

    // -------------------------------------------------------------------------
    // Admin Role Management
    // -------------------------------------------------------------------------

    function updateAgency(address _agency, bool _isActive) external onlyAdmin {
        agencies[_agency] = _isActive;
        emit AgencyUpdated(_agency, _isActive);
    }

    function updateAuditor(address _auditor, bool _isActive) external onlyAdmin {
        auditors[_auditor] = _isActive;
        emit AuditorUpdated(_auditor, _isActive);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Zero address");
        admin = _newAdmin;
    }

    // -------------------------------------------------------------------------
    // Project Lifecycle
    // -------------------------------------------------------------------------

    /**
     * @dev Register a new GMC project.
     * @param _name         Project name, e.g. "GMC Central Hospital"
     * @param _sector       Sector, e.g. "Health"
     * @param _agency       Implementing agency address
     * @param _contractor   Contractor address for fund release
     * @param _budget       Total budget in wei (must be pre-funded or funded later)
     * @param _metadataURI  Off-chain metadata (IPFS / API URI)
     */
    function registerProject(
        string calldata _name,
        string calldata _sector,
        address _agency,
        address _contractor,
        uint256 _budget,
        string calldata _metadataURI
    ) external onlyAdmin returns (uint256) {
        require(_agency != address(0), "Invalid agency");
        require(_contractor != address(0), "Invalid contractor");
        require(_budget > 0, "Budget must be > 0");

        projectCounter += 1;
        uint256 projectId = projectCounter;

        Project storage p = projects[projectId];
        p.id = projectId;
        p.name = _name;
        p.sector = _sector;
        p.agency = _agency;
        p.contractor = _contractor;
        p.budget = _budget;
        p.createdAt = block.timestamp;
        p.status = ProjectStatus.Registered;
        p.totalReleased = 0;
        p.metadataURI = _metadataURI;
        p.milestoneCount = 0;
        p.exists = true;

        emit ProjectRegistered(
            projectId,
            _name,
            _sector,
            _agency,
            _contractor,
            _budget,
            _metadataURI
        );

        return projectId;
    }

    function updateProjectStatus(
        uint256 _projectId,
        ProjectStatus _newStatus
    ) external {
        Project storage p = projects[_projectId];
        require(p.exists, "Project not found");
        // Admin or implementing agency can update status
        require(
            msg.sender == admin || msg.sender == p.agency,
            "Not authorized"
        );

        ProjectStatus old = p.status;
        p.status = _newStatus;

        emit ProjectStatusChanged(_projectId, old, _newStatus);
    }

    // -------------------------------------------------------------------------
    // Milestones
    // -------------------------------------------------------------------------

    /**
     * @dev Add a milestone to a project.
     *      Only admin or implementing agency can define milestones.
     */
    function addMilestone(
        uint256 _projectId,
        string calldata _name,
        uint256 _amount,
        uint256 _dueDate
    ) external {
        Project storage p = projects[_projectId];
        require(p.exists, "Project not found");
        require(
            msg.sender == admin || msg.sender == p.agency,
            "Not authorized"
        );
        require(_amount > 0, "Amount must be > 0");
        require(
            p.totalReleased + _amount <= p.budget,
            "Milestone exceeds project budget"
        );

        p.milestoneCount += 1;
        uint256 milestoneId = p.milestoneCount;

        Milestone storage m = milestones[_projectId][milestoneId];
        m.id = milestoneId;
        m.name = _name;
        m.amount = _amount;
        m.dueDate = _dueDate;
        m.isCompleted = false;
        m.isApproved = false;
        m.completedAt = 0;
        m.approvedAt = 0;

        emit MilestoneAdded(_projectId, milestoneId, _name, _amount, _dueDate);
    }

    /**
     * @dev Mark a milestone as completed.
     *      Could be called by agency or contractor (you can restrict further if needed).
     */
    function markMilestoneCompleted(
        uint256 _projectId,
        uint256 _milestoneId
    ) external {
        Project storage p = projects[_projectId];
        require(p.exists, "Project not found");

        Milestone storage m = milestones[_projectId][_milestoneId];
        require(m.id != 0, "Milestone not found");
        require(!m.isCompleted, "Already completed");

        // Allow contractor or agency to mark completion
        require(
            msg.sender == p.agency || msg.sender == p.contractor,
            "Not authorized"
        );

        m.isCompleted = true;
        m.completedAt = block.timestamp;

        emit MilestoneCompleted(
            _projectId,
            _milestoneId,
            msg.sender,
            m.completedAt
        );
    }

    /**
     * @dev Approve a completed milestone and release funds to contractor.
     *      Only auditors can approve and trigger release.
     *      NOTE: Contract must hold enough ETH to pay the milestone.
     */
    function approveMilestoneAndReleaseFunds(
        uint256 _projectId,
        uint256 _milestoneId
    ) external onlyAuditor nonReentrant {
        Project storage p = projects[_projectId];
        require(p.exists, "Project not found");

        Milestone storage m = milestones[_projectId][_milestoneId];
        require(m.id != 0, "Milestone not found");
        require(m.isCompleted, "Milestone not completed");
        require(!m.isApproved, "Already approved");

        // Update state BEFORE external call
        m.isApproved = true;
        m.approvedAt = block.timestamp;

        uint256 amount = m.amount;

        require(
            p.totalReleased + amount <= p.budget,
            "Exceeds project budget"
        );
        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );

        p.totalReleased += amount;

        emit MilestoneApproved(
            _projectId,
            _milestoneId,
            msg.sender,
            m.approvedAt
        );

        // External call to contractor (fund release)
        (bool ok, ) = p.contractor.call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsReleased(_projectId, _milestoneId, p.contractor, amount);
    }

    // -------------------------------------------------------------------------
    // Funding Management
    // -------------------------------------------------------------------------

    /**
     * @dev Deposit ETH into the contract to fund projects.
     *      In production, this would be called from a treasury / MoF wallet.
     */
    function fundContract() external payable {
        require(msg.value > 0, "No ETH sent");
        // No event needed beyond standard node logs, but you can add one if you want.
    }

    /**
     * @dev Helper: get basic project info in one call (for dashboards).
     */
    function getProject(
        uint256 _projectId
    )
        external
        view
        returns (
            string memory name,
            string memory sector,
            address agency,
            address contractor,
            uint256 budget,
            uint256 totalReleased,
            ProjectStatus status,
            string memory metadataURI,
            uint256 milestoneCount,
            uint256 createdAt
        )
    {
        Project storage p = projects[_projectId];
        require(p.exists, "Project not found");

        return (
            p.name,
            p.sector,
            p.agency,
            p.contractor,
            p.budget,
            p.totalReleased,
            p.status,
            p.metadataURI,
            p.milestoneCount,
            p.createdAt
        );
    }

    /**
     * @dev Helper: get a single milestone.
     */
    function getMilestone(
        uint256 _projectId,
        uint256 _milestoneId
    )
        external
        view
        returns (
            string memory name,
            uint256 amount,
            uint256 dueDate,
            bool isCompleted,
            bool isApproved,
            uint256 completedAt,
            uint256 approvedAt
        )
    {
        Milestone storage m = milestones[_projectId][_milestoneId];
        require(m.id != 0, "Milestone not found");

        return (
            m.name,
            m.amount,
            m.dueDate,
            m.isCompleted,
            m.isApproved,
            m.completedAt,
            m.approvedAt
        );
    }

    // -------------------------------------------------------------------------
    // Fallback
    // -------------------------------------------------------------------------

    receive() external payable {
        // Accept plain ETH transfers (funding).
    }
}
