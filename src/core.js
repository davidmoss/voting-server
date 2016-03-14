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
  return state.merge({
    'entries': entries,
    'initialEntries': entries
  });
}

export function next(state, round = state.get('round', 0)) {
  const entries = state.get('entries')
                       .concat(getWinners(state.get('vote')));
  if(entries.size === 1) {
    return state.remove('vote')
                .remove('entries')
                .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({
        pair: entries.take(2)
      }),
      round: round + 1,
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

export function restart(state) {
  const round = state.get('round', 0);
  return next(
    state.set('entries', state.get('initialEntries'))
         .remove('vote')
         .remove('winner'),
    round
  );
}
