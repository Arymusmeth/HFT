
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

const DAO_ADDRESS = "<DIRECCION_DEL_CONTRATO>";
const ABI = [
  "function createProposal(address to, uint256 value, bytes data) external",
  "function vote(uint256 proposalId, bool inFavor) external",
  "function executeProposal(uint256 proposalId) external",
  "function proposals(uint256) public view returns (address to, uint256 value, bytes data, bool executed, uint256 votesFor, uint256 votesAgainst)",
  "function isMember(address account) public view returns (bool)"
];

export default function IA_DAO_Matrix() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [proposalId, setProposalId] = useState(0);
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return;
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const contract = new ethers.Contract(DAO_ADDRESS, ABI, signer);
      setContract(contract);
      setProvider(provider);
    };
    init();
  }, []);

  const loadProposal = async () => {
    const p = await contract.proposals(proposalId);
    setProposal(p);
  };

  const voteProposal = async (inFavor) => {
    await contract.vote(proposalId, inFavor);
    loadProposal();
  };

  const execute = async () => {
    await contract.executeProposal(proposalId);
    loadProposal();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-4">🤖 IA DAO Matrix</h1>
      <p className="mb-2">Conectado como: {account}</p>
      <div className="mb-4">
        <label className="block mb-1">ID de Propuesta:</label>
        <input
          type="number"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <Button onClick={loadProposal} className="mt-2">Cargar Propuesta</Button>
      </div>

      {proposal && (
        <div className="bg-gray-800 p-4 rounded">
          <p><strong>Destino:</strong> {proposal.to}</p>
          <p><strong>Valor:</strong> {ethers.utils.formatEther(proposal.value)} ETH</p>
          <p><strong>Ejecutada:</strong> {proposal.executed ? "Sí" : "No"}</p>
          <p><strong>Votos a Favor:</strong> {proposal.votesFor.toString()}</p>
          <p><strong>Votos en Contra:</strong> {proposal.votesAgainst.toString()}</p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => voteProposal(true)}>✅ Votar A Favor</Button>
            <Button onClick={() => voteProposal(false)}>❌ Votar En Contra</Button>
            <Button onClick={execute}>🚀 Ejecutar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
