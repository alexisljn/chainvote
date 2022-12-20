// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
* @author alexisljn
* @notice Simple voting smart contract for a small organization
*/
contract Voting is Ownable {

    mapping(address => Voter) private _voters;

    /* @dev Helper variable to handle easily CRUD in _voters mapping */
    address[] public votersId;

    mapping(uint => Proposal) public proposals;

    /* @dev Helper variable to handle easily CRUD in proposals mapping */
    uint[] public proposalsId;

    uint private _winningProposalId;

    /* @dev Store the proposals that have equal vote count */
    uint[] private _tiedProposals;

    /* @notice Allows everybody to consult the history of the winning proposals */
    Proposal[] public winningProposalHistory;

    WorkflowStatus private _voteStatus;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
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

    /*
    * @notice Allows administrator to add a new voter to voting.
    * @param _address The address to add as registred voter
    */
    function registerVoter(address _address) external onlyOwner {
        require(_voteStatus == WorkflowStatus.RegisteringVoters, "Registering new voters is not allowed for the current voting");

        require(_address != address(0), "0 address is invalid");

        require(!_voters[_address].isRegistered, "Voter is already registred");

        _voters[_address] = Voter(true, false, 0);

        votersId.push(_address);

        emit VoterRegistered(_address);
    }

    /*
    * @notice Allows administrato change voting status. CountingEquality and VotesTallied can't be automatically triggered by administrator
    * @param _status The status to set
    */
    function setWorkflowStatus(WorkflowStatus _status) external onlyOwner {
        require(_status != WorkflowStatus.CountingEquality, "Counting equality can only be trigger by the contract itself");

        require(_status != WorkflowStatus.VotesTallied, "Votes tallied can only be trigger by the contract itself");

        WorkflowStatus previousStatus = _voteStatus;

        _voteStatus = _status;

        emit WorkflowStatusChange(previousStatus, _status);
    }

    /*
    * @notice Allows voters to submit proposals for voting session
    * @param description the description of the submitted proposal
    */
    function addProposal(string calldata description) external onlyVoter {
        require(_voteStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposal cannot be submitted for the current voting");

        require(keccak256(abi.encodePacked(description)) != keccak256(abi.encodePacked("")), "Proposal description cannot be empty");

        uint proposalId = uint(keccak256(abi.encodePacked(description, block.timestamp, msg.sender)));

        proposals[proposalId] = Proposal(description, 0);

        proposalsId.push(proposalId);

        emit ProposalRegistered(proposalId);
    }

    /*
    * @notice Allows voter to vote for a proposal
    * @param proposalId The id of the proposal the voter wants to vote for
    */
    function vote(uint proposalId) external onlyVoter {
        require(_voteStatus == WorkflowStatus.VotingSessionStarted, "Vote cannot be submitted for the current voting");

        require(keccak256(abi.encodePacked(proposals[proposalId].description)) != keccak256(abi.encodePacked("")), "Proposal not found");

        require(_voters[msg.sender].votedProposalId == 0, "You already vote for a proposal");

        Voter storage voter = _voters[msg.sender];
        voter.hasVoted = true;
        voter.votedProposalId = proposalId;

        proposals[proposalId].voteCount++;

        emit Voted(msg.sender, proposalId);
    }

    /*
    * @notice Allows administrator to count votes and close voting
    * @dev Function has a system to handle an equality between proposals.
    */
    function pickWinner() external onlyOwner {
        require(_voteStatus ==  WorkflowStatus.VotingSessionEnded, "Votes cannot be counted at this moment for the current voting");

        require(proposalsId.length > 0, "There is no proposal for this voting");

        uint tempWinningProposalId;

        for (uint i = 0; i < proposalsId.length; i++) {
            Proposal memory currentProposal = proposals[proposalsId[i]];
            Proposal memory winningProposal = proposals[tempWinningProposalId];

            if (currentProposal.voteCount > winningProposal.voteCount) {
                tempWinningProposalId = proposalsId[i];

                if (_tiedProposals.length > 0) {
                    delete _tiedProposals;
                }

            } else if (currentProposal.voteCount == winningProposal.voteCount && winningProposal.voteCount > 0) { // Equality
                // Reset array if new tie has more votes than previous one
                if (_tiedProposals.length > 0 && winningProposal.voteCount > proposals[_tiedProposals[_tiedProposals.length-1]].voteCount) {
                    delete _tiedProposals;
                }

                // Push "secondary" proposal of the tie
                _tiedProposals.push(proposalsId[i]);

                // Check if current winningProposal ("main" proposal of the tie) is already in the array (in case of more than two tied proposals)
                if (_tiedProposals.length == 1 || _tiedProposals[1] != tempWinningProposalId) {
                    _tiedProposals.push(tempWinningProposalId);
                }
            }
        }

        require(proposals[tempWinningProposalId].voteCount > 0, "No proposal has a single vote for the current voting");

        if (_tiedProposals.length > 0 ) {
            _voteStatus = WorkflowStatus.CountingEquality;
            emit Equality(_tiedProposals);
        } else {
            _winningProposalId = tempWinningProposalId;
            _voteStatus = WorkflowStatus.VotesTallied;
            emit WinningProposal(_winningProposalId);
        }
    }

    /*
    * @notice Allows administator to prepare a new ballot vor a voting that has an equality in proposals vote.
    */
    function prepareNewBallot() external onlyOwner {
        require(_voteStatus == WorkflowStatus.CountingEquality, "New ballot can only be prepared for an equality");

        // Reset voters attribute
        for (uint i = 0; i < votersId.length; i++) {
            Voter storage voter = _voters[votersId[i]];
            voter.hasVoted = false;
            voter.votedProposalId = 0;
        }

        // Reset proposals
        _keepTiedProposals();

        _voteStatus = WorkflowStatus.VotingSessionStarted;

        emit NewBallotPrepared();
    }

    /*
    * @notice Allows administrator to reset all properties of contract in order to have clean state for next votings
    */
    function resetVoting() external onlyOwner {
        require(_voteStatus == WorkflowStatus.VotesTallied, "Resetting voting is allowed only when votes have been counted");

        winningProposalHistory.push(proposals[_winningProposalId]);

        delete _winningProposalId;

        for(uint i = 0; i < proposalsId.length; i++) {
            delete proposals[proposalsId[i]];
        }

        delete proposalsId;

        for(uint i = 0; i < votersId.length; i++) {
            delete _voters[votersId[i]];
        }

        delete votersId;

        emit VotingReset();
    }

    function _keepTiedProposals() private {
        Proposal[] memory proposalsToKeep = new Proposal[](_tiedProposals.length);

        // Keep tied proposals in memory array
        for (uint i = 0; i < _tiedProposals.length; i++) {
            proposalsToKeep[i] = proposals[_tiedProposals[i]];
        }

        // Delete all proposals from mapping
        for (uint i = 0; i < proposalsId.length; i++) {
            delete proposals[proposalsId[i]];
        }

        // Affect proposalsId storage array to _tiedProposals
        proposalsId = _tiedProposals;

        delete _tiedProposals;

        // Reset proposal properties and store them into mapping
        for (uint i = 0; i < proposalsId.length; i++) {
            Proposal memory proposalToKeep = proposalsToKeep[i];

            proposalToKeep.voteCount = 0;

            proposals[proposalsId[i]] = proposalToKeep;
        }
    }

    /*
    * @notice Allows administrator to pick randomly a proposal among those which has same vote count.
    * @notice Should be used when no proposal won in multiple ballots.
    */
    function pickWinnerRandomly() external onlyOwner {
        require(_voteStatus == WorkflowStatus.CountingEquality, "Winning proposal can only be randomly picked if there is an equality");

        assert(_tiedProposals.length > 0);

        _keepTiedProposals();

        uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, block.number, block.basefee))) % _tiedProposals.length;

        _winningProposalId = proposalsId[randomIndex];

        _voteStatus = WorkflowStatus.VotesTallied;

        emit WinningProposal(_winningProposalId);
    }

    /*
    * @notice Allows everybody to consult the winning proposal at the end of a voting
    */
    function getWinner() external view returns(Proposal memory) {
        require(_voteStatus == WorkflowStatus.VotesTallied, "Voting is not over or has not began");

        return proposals[_winningProposalId];
    }

    /*
    * @notice Allows administrator and voters to see for which proposal a certain voter has voted for
    * @param _address The address of the voter
    */
    function getVoterVote(address _address) external view returns(Proposal memory) {
        require(msg.sender == owner() || _voters[msg.sender].isRegistered, "You should be owner or voter to see voter's vote");

        require(_address != address(0), "0 address is invalid");

        Voter memory voter = _voters[_address];

        require(voter.isRegistered, "Voter not found");

        return proposals[voter.votedProposalId];
    }

    /*
    * @notice Allows everybody to get full list of proposalsId in one call.
    * @dev Helper function
    */
    function getProposalsId() external view returns(uint[] memory) {
        return proposalsId;
    }

    /*
    * @notice Allows everybody to get full list of votersId in one call.
    * @dev Helper function
    */
    function getVotersId() external view returns(address[] memory) {
        return votersId;
    }

    /*
    * @notice Allows everybody to know the voting status
    */
    function getStatus() external view returns(WorkflowStatus) {
        return _voteStatus;
    }
}