import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

function getWinners(vote) {
  if(!vote) return [];
  const [a, b] = vote.get('pair');
  const aVote = vote.getIn(['tally', a], 0);
  const bVote = vote.getIn(['tally', b], 0);
  if(aVote > bVote)      return [a];
  else if(bVote > aVote) return [b];
  else                   return [a, b];
}

export function setEntries(state, entries) {
  if(typeof(entries) === 'object'){
    entries = List(entries);
  }
  return state.set('entries', entries);
}

export function next(state) {
  const entries = state.get('entries')
                       .concat(getWinners(state.get('vote')));
  if(entries.size === 1) {
    return state.remove('vote')
                .remove('entries')
                .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({
        round: state.getIn(['vote', 'round'], 0) + 1,
        pair: entries.take(2)
      }),
      entries: entries.skip(2)
    });
  }
}

function removePreviousVote(voteState, voter) {
  const previousEntry = voteState.getIn(['votes', voter]);
  if (previousEntry) {
    return voteState.updateIn(['tally', previousEntry], tally => tally - 1)
                    .removeIn(['votes', voter]);

  } else {
    return voteState;
  }
}

function addVote(voteState, entry, voter) {
  const currentPair = voteState.get('pair');
  if(currentPair && currentPair.includes(entry)){
    return voteState.updateIn(['tally', entry], 0, tally => tally + 1)
                    .setIn(['votes', voter], entry);
  } else {
    return voteState;
  }
}

export function vote(voteState, entry, voter) {
  return addVote(
    removePreviousVote(voteState, voter),
    entry,
    voter
  )
}
