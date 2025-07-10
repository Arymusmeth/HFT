
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IA_Governed_DAO {
    address[] public members;
    mapping(address => uint256) public votes;

    struct Proposal {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    Proposal[] public proposals;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyMember() {
        require(isMember(msg.sender), "Not DAO member");
        _;
    }

    constructor(address[] memory _members) {
        members = _members;
        owner = msg.sender;
    }

    function addMember(address newMember) external onlyOwner {
        members.push(newMember);
    }

    function removeMember(address memberToRemove) external onlyOwner {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == memberToRemove) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }
    }

    function createProposal(address to, uint256 value, bytes memory data) external onlyOwner {
        proposals.push(Proposal({
            to: to,
            value: value,
            data: data,
            executed: false,
            votesFor: 0,
            votesAgainst: 0
        }));
    }

    function vote(uint256 proposalId, bool inFavor) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");

        if (inFavor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Not enough support");

        (bool success, ) = proposal.to.call{value: proposal.value}(proposal.data);
        require(success, "Execution failed");
        proposal.executed = true;
    }

    function isMember(address account) public view returns (bool) {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == account) {
                return true;
            }
        }
        return false;
    }
}
