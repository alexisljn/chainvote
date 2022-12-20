// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
* @author alexisljn
* @notice Simple voting smart contract for a small organization
*/
contract Voting is Ownable {

    using Counters for Counters.Counter;

    Counters.Counter private _votingSession;

    mapping(address => Voter) private _voters;

    /* @dev Helper variable to handle easily CRUD in _voters mapping */
    address[] public votersId;

    Proposal[] public proposals;

    uint private _winningProposalId;

    /* @dev Store the proposals that have equal vote count */
    uint[] private _tiedProposals;

    /* @notice Allows everybody to consult the history of the winning proposals */
    Proposal[] public winningProposalHistory;

    WorkflowStatus private _voteStatus;

    struct Voter {
        bool isRegistered;
        uint256 lastVotingSession;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        CountingEquality,
        VotesTallied
    }

    event VoterRegistered(address voterAddress);

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    event ProposalRegistered(uint proposalId);

    event Voted(address voter, uint proposalId);

    event NewBallotPrepared();

    event VotingReset();

    event WinningProposal(uint proposalId);

    event Equality(uint[] proposalsId);

    modifier onlyVoter {
        require(_voters[msg.sender].isRegistered, "Address is not registered as allowed voter");
        _;
    }

    constructor() Ownable() {
        _votingSession.increment();
    }

    /*
    * @notice Allows administrator to add a new voter to voting.
    * @param _address The address to add as registred voter
    */
    function registerVoter(address _address) external onlyOwner {
        require(_voteStatus == WorkflowStatus.RegisteringVoters, "Registering new voters is not allowed for the current voting");

        require(_address != address(0), "0 address is invalid");

        require(!_voters[_address].isRegistered, "Voter is already registered");

        _voters[_address].isRegistered = true;

        votersId.push(_address);

        emit VoterRegistered(_address);
    }

    /**
    * @notice Allow administrator to start the registration of voters
    */
    function registeringVoters() external onlyOwner {
        require(_voteStatus == WorkflowStatus.VotesTallied, "Current voting is not finished");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.RegisteringVoters;

        emit WorkflowStatusChange(previousStatus, _voteStatus);
    }

    /**
    * @notice Allow administrator to start the registration of proposals for voters
    */
    function startProposalsRegistration() external onlyOwner {
        require(_voteStatus == WorkflowStatus.RegisteringVoters, "Current voting is not registering voters");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.ProposalsRegistrationStarted;

        emit WorkflowStatusChange(previousStatus, _voteStatus);
    }

    /**
    * @notice Allow administrator to end the registration of proposals for voters
    */
    function endProposalsRegistration() external onlyOwner {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationStarted, "Current voting is not registering proposals");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.ProposalsRegistrationEnded;

        emit WorkflowStatusChange(previousStatus, _voteStatus);
    }

    /**
    * @notice Allow administrator to start the voting period of voters
    */
    function startVotingSession() external onlyOwner {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationEnded, "Current voting is still registering proposals");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.VotingSessionStarted;

        emit WorkflowStatusChange(previousStatus, _voteStatus);
    }

    /**
    * @notice Allow administrator to end the voting period of voters
    */
    function endVotingSession() external onlyOwner {
        require(_voteStatus == WorkflowStatus.VotingSessionStarted, "Current voting session hasn't started");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.VotingSessionEnded;

        emit WorkflowStatusChange(previousStatus, _voteStatus);
    }

    /*
    * @notice Allows voters to submit proposals for voting session
    * @param description the description of the submitted proposal
    */
    function addProposal(string calldata description) external onlyVoter {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposal cannot be submitted for the current voting");

        require(keccak256(abi.encodePacked(description)) != keccak256(abi.encodePacked("")), "Proposal description cannot be empty");

        Proposal memory newProposal = Proposal(description, 0);

        proposals.push(newProposal);

        emit ProposalRegistered(proposals.length - 1);
    }

    /*
    * @notice Allows everybody to know the voting status
    */
    function getStatus() external view returns(WorkflowStatus) {
        return _voteStatus;
    }
}