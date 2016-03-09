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
      vote: Map({pair: entries.take(2)}),
      entries: entries.skip(2)
    });
  }
}

export function vote(state, entry) {
  return state.updateIn(
    ['tally', entry],
    0,
    tally => tally + 1
  )
}
