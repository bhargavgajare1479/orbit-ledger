const crypto = require('crypto');

/**
 * 4-Node Practical Byzantine Fault Tolerance (PBFT) Consortium Simulator.
 * Implements Castro-Liskov state machine: Pre-Prepare, Prepare, and Commit phases.
 * Formulated for N = 4, f = 1, Quorum = 2f + 1 = 3.
 */
class PBFTConsortium {
  constructor(nodeCount = 4) {
    this.nodeCount = nodeCount;
    this.f = Math.floor((nodeCount - 1) / 3); // Tolerable faults = 1
    this.quorum = 2 * this.f + 1; // 3 matching votes required

    this.nodes = [
      { id: 'Node-1-Alpha', role: 'Primary', faultMode: 'honest', address: '0x0a70f9F1f5fDDc0c34b8Bb44463bd0204b8af922' },
      { id: 'Node-2-Beta', role: 'Replica', faultMode: 'honest', address: '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5' },
      { id: 'Node-3-Gamma', role: 'Replica', faultMode: 'honest', address: '0xa4e24D1e363fb45f5A43A838Ce547B36F4Bea4d2' },
      { id: 'Node-4-Delta', role: 'Replica', faultMode: 'honest', address: '0x1efEb9163C90B96FEe44FBb9c0aE7920E67101ab' }
    ];

    this.view = 0;
    this.sequenceNumber = 0;
  }

  /**
   * Sets fault mode for a specific node
   * @param {string} nodeId
   * @param {'honest'|'offline'|'conflicting'} mode
   */
  setNodeFault(nodeId, mode) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    node.faultMode = mode;
  }

  /**
   * Resets all nodes to honest operation
   */
  resetFaults() {
    this.nodes.forEach(n => { n.faultMode = 'honest'; });
  }

  /**
   * Simulates a complete PBFT consensus round over a candidate block hash
   * @param {string} blockHash Proposed block hash
   * @param {number} blockIndex Block height index
   * @returns {object} Execution summary with phase logs, quorum tallies, and commit result
   */
  runConsensusRound(blockHash, blockIndex) {
    const log = [];
    this.sequenceNumber = blockIndex;
    const primaryIndex = this.view % this.nodeCount;
    const primary = this.nodes[primaryIndex];

    log.push({
      phase: 'INIT',
      message: `Starting PBFT consensus round for Block ${blockIndex} (View: ${this.view}, Sequence: ${this.sequenceNumber})`,
      quorumRequired: this.quorum,
      toleratedFaults: this.f
    });

    // Phase 1: Pre-Prepare
    let prePrepareMsg = null;
    if (primary.faultMode === 'offline') {
      log.push({
        phase: 'PRE-PREPARE',
        node: primary.id,
        status: 'FAILED',
        message: `Primary node ${primary.id} is OFFLINE: no proposal broadcast.`
      });
      return {
        committed: false,
        reason: 'PRIMARY_OFFLINE',
        log
      };
    }

    const proposedHash = primary.faultMode === 'conflicting'
      ? crypto.createHash('sha256').update(`${blockHash}:BYZANTINE`).digest('hex')
      : blockHash;

    prePrepareMsg = {
      type: 'PRE-PREPARE',
      view: this.view,
      sequence: this.sequenceNumber,
      blockHash: proposedHash,
      sender: primary.id
    };

    log.push({
      phase: 'PRE-PREPARE',
      node: primary.id,
      status: 'BROADCAST',
      message: `${primary.id} (Primary) broadcasts proposal with hash ${proposedHash.slice(0, 16)}...`,
      proposal: prePrepareMsg
    });

    // Phase 2: Prepare Phase
    const prepareVotes = [];
    for (const node of this.nodes) {
      if (node.faultMode === 'offline') {
        log.push({
          phase: 'PREPARE',
          node: node.id,
          status: 'SILENT',
          message: `${node.id} is OFFLINE: dropped prepare vote.`
        });
        continue;
      }

      let voteHash = proposedHash;
      if (node.faultMode === 'conflicting') {
        voteHash = crypto.createHash('sha256').update(`${node.id}:CORRUPTED`).digest('hex');
        log.push({
          phase: 'PREPARE',
          node: node.id,
          status: 'BYZANTINE',
          message: `${node.id} sent CONFLICTING prepare vote with altered hash.`
        });
      } else {
        log.push({
          phase: 'PREPARE',
          node: node.id,
          status: 'VOTE',
          message: `${node.id} validated proposal and broadcast prepare vote.`
        });
      }

      prepareVotes.push({ sender: node.id, voteHash });
    }

    // Tally prepare votes matching genuine proposedHash
    const validPrepareVotes = prepareVotes.filter(v => v.voteHash === proposedHash);
    const prepareQuorumReached = validPrepareVotes.length >= this.quorum;

    log.push({
      phase: 'PREPARE_EVAL',
      matchingVotes: validPrepareVotes.length,
      quorumRequired: this.quorum,
      quorumReached: prepareQuorumReached,
      message: `Prepare Phase: ${validPrepareVotes.length}/${this.nodeCount} valid votes collected (Quorum required: ${this.quorum}).`
    });

    if (!prepareQuorumReached) {
      log.push({
        phase: 'HALT',
        status: 'CONSENSUS_FAILED',
        message: `Consensus halted: only ${validPrepareVotes.length} matching prepare votes collected. Minimum required is ${this.quorum}. Faulty nodes exceeded tolerance f = ${this.f}.`
      });
      return {
        committed: false,
        phase: 'PREPARE',
        matchingVotes: validPrepareVotes.length,
        quorumRequired: this.quorum,
        reason: 'PREPARE_QUORUM_NOT_MET',
        log
      };
    }

    // Phase 3: Commit Phase
    const commitVotes = [];
    for (const node of this.nodes) {
      if (node.faultMode === 'offline') {
        log.push({
          phase: 'COMMIT',
          node: node.id,
          status: 'SILENT',
          message: `${node.id} is OFFLINE: dropped commit vote.`
        });
        continue;
      }

      let commitHash = proposedHash;
      if (node.faultMode === 'conflicting') {
        commitHash = crypto.createHash('sha256').update(`${node.id}:COMMIT_CORRUPT`).digest('hex');
        log.push({
          phase: 'COMMIT',
          node: node.id,
          status: 'BYZANTINE',
          message: `${node.id} sent CONFLICTING commit vote.`
        });
      } else {
        log.push({
          phase: 'COMMIT',
          node: node.id,
          status: 'VOTE',
          message: `${node.id} verified prepared certificate and broadcast commit vote.`
        });
      }

      commitVotes.push({ sender: node.id, commitHash });
    }

    const validCommitVotes = commitVotes.filter(v => v.commitHash === proposedHash);
    const commitQuorumReached = validCommitVotes.length >= this.quorum;

    log.push({
      phase: 'COMMIT_EVAL',
      matchingVotes: validCommitVotes.length,
      quorumRequired: this.quorum,
      quorumReached: commitQuorumReached,
      message: `Commit Phase: ${validCommitVotes.length}/${this.nodeCount} commit votes collected (Quorum required: ${this.quorum}).`
    });

    if (!commitQuorumReached) {
      log.push({
        phase: 'HALT',
        status: 'CONSENSUS_FAILED',
        message: `Consensus halted at commit phase: ${validCommitVotes.length}/${this.quorum} required votes.`
      });
      return {
        committed: false,
        phase: 'COMMIT',
        matchingVotes: validCommitVotes.length,
        quorumRequired: this.quorum,
        reason: 'COMMIT_QUORUM_NOT_MET',
        log
      };
    }

    log.push({
      phase: 'COMMITTED',
      status: 'SUCCESS',
      message: `Block ${blockIndex} finalized with ${validCommitVotes.length}/${this.nodeCount} operator commit signatures.`,
      signers: validCommitVotes.map(v => v.sender)
    });

    return {
      committed: true,
      blockHash: proposedHash,
      matchingVotes: validCommitVotes.length,
      quorumRequired: this.quorum,
      signers: validCommitVotes.map(v => v.sender),
      log
    };
  }
}

module.exports = { PBFTConsortium };
