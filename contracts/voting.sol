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

    Proposal[] public proposals;

    // Max proposals per voting ?
    uint8 private constant _maxProposalsPerVoting = 20;

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

    event VoterRegistered(address voterAddress, address caller);

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus, address caller);

    event ProposalRegistered(uint proposalId, address caller);

    event Voted(address voter, uint proposalId);

    event NewBallotPrepared(address caller);

    event VotingReset(address caller);

    event WinningProposal(uint proposalId, address caller);

    event Equality(uint[] proposalsId, address caller);

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

        emit VoterRegistered(_address, msg.sender);
    }

    /**
    * @notice Allow administrator to start the registration of voters
    */
    function registeringVoters() external onlyOwner {
        require(_voteStatus == WorkflowStatus.VotesTallied, "Current voting is not finished");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.RegisteringVoters;

        emit WorkflowStatusChange(previousStatus, _voteStatus, msg.sender);
    }

    /**
    * @notice Allow administrator to start the registration of proposals for voters
    */
    function startProposalsRegistration() external onlyOwner {
        require(_voteStatus == WorkflowStatus.RegisteringVoters, "Current voting is not registering voters");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.ProposalsRegistrationStarted;

        emit WorkflowStatusChange(previousStatus, _voteStatus, msg.sender);
    }

    /**
    * @notice Allow administrator to end the registration of proposals for voters
    */
    function endProposalsRegistration() external onlyOwner {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationStarted, "Current voting is not registering proposals");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.ProposalsRegistrationEnded;

        emit WorkflowStatusChange(previousStatus, _voteStatus, msg.sender);
    }

    /**
    * @notice Allow administrator to start the voting period of voters
    */
    function startVotingSession() external onlyOwner {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationEnded, "Current voting is still registering proposals");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.VotingSessionStarted;

        emit WorkflowStatusChange(previousStatus, _voteStatus, msg.sender);
    }

    /**
    * @notice Allow administrator to end the voting period of voters
    */
    function endVotingSession() external onlyOwner {
        require(_voteStatus == WorkflowStatus.VotingSessionStarted, "Current voting session hasn't started");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = WorkflowStatus.VotingSessionEnded;

        emit WorkflowStatusChange(previousStatus, _voteStatus, msg.sender);
    }

    /*
    * @notice Allows voters to submit proposals for voting session
    * @param description the description of the submitted proposal
    */
    function addProposal(string calldata description) external onlyVoter {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposal cannot be submitted for the current voting");

        require(keccak256(abi.encodePacked(description)) != keccak256(abi.encodePacked("")), "Proposal description cannot be empty");

        require(proposals.length + 1 <= _maxProposalsPerVoting, "Too much proposals for current voting");

        Proposal memory newProposal = Proposal(description, 0);

        proposals.push(newProposal);

        emit ProposalRegistered(proposals.length - 1, msg.sender);
    }

    /*
    * @notice Allows voter to vote for a proposal
    * @param proposalId The id of the proposal the voter wants to vote for
    */
    function vote(uint proposalId) external onlyVoter {
        require(_voteStatus == WorkflowStatus.VotingSessionStarted, "Vote cannot be submitted for the current voting");

        require(proposals.length > proposalId, "Proposal not found");

        uint256 currentVotingSession = _votingSession.current();

        Voter storage voter = _voters[msg.sender];

        voter.lastVotingSession = currentVotingSession;

        voter.votedProposalId = proposalId;

        voter.isRegistered = false;

        proposals[proposalId].voteCount++;

        // No previous equality
        if (_tiedProposals.length == 0) {

            // Winning proposal gets another vote
            if (proposalId == _winningProposalId) {
                emit Voted(msg.sender, proposalId);

                return;
            }

            // New winning proposal
            if (proposals[proposalId].voteCount > proposals[_winningProposalId].voteCount) {
                _winningProposalId = proposalId;

            // New equality
            } else if (proposals[proposalId].voteCount == proposals[_winningProposalId].voteCount) {
                _tiedProposals.push(_winningProposalId);
                _tiedProposals.push(proposalId);
            }
        } else { // Previous equality

            // New winning proposal, no more equality
            if (proposals[proposalId].voteCount > proposals[_tiedProposals[0]].voteCount) {
                _winningProposalId = proposalId;
                delete _tiedProposals;

            // New proposal has equal votes as tied ones
            } else if (proposals[proposalId].voteCount == proposals[_tiedProposals[0]].voteCount) {
                _tiedProposals.push(proposalId);
            }
        }

        emit Voted(msg.sender, proposalId);
    }

    /*
    * @notice Allows administrator to count votes and close voting
    * @dev Function has a system to handle an equality between proposals.
    */
    function pickWinner() external onlyOwner {
        require(_voteStatus ==  WorkflowStatus.VotingSessionEnded, "Voting session is not finished");

        require(proposals.length > 0, "There is no proposal for this voting");

        require(proposals[_winningProposalId].voteCount > 0, "No proposal has a single vote for the current voting");

        if (_tiedProposals.length > 0 ) {
            _voteStatus = WorkflowStatus.CountingEquality;

            emit Equality(_tiedProposals, msg.sender);
        } else {
            _voteStatus = WorkflowStatus.VotesTallied;

            winningProposalHistory.push(proposals[_winningProposalId]);

            _votingSession.increment();

            emit WinningProposal(_winningProposalId, msg.sender);
        }
    }

    /*
    * @notice Allows everybody to know the voting status
    */
    function getStatus() external view returns(WorkflowStatus) {
        return _voteStatus;
    }
}