import * as actions from './game.action'

const INITIAL_STATE = {
    players: [],
    board: [[]],
    activeField: {x: -1, y: -1},
    commands: [],
    userColors: {},
    playerRole: 'lobby',
    usersStats: {},
    tourCounter: 0,
}

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case actions.SET_PLAYERS:
            return {
                ...state, 
                players: action.payload, 
                userColors: action.payload.reduce((acc, v) => ({...acc, [v.socketId]: v.color}), {})
            }
        case actions.SET_BOARD:
            return {...state, board: action.payload}
        case actions.SET_ACTIVE_FIELD:
            return {...state, activeField: action.payload}
        case actions.SET_COMMANDS:
            return {...state, commands: action.payload}
        case actions.REMOVE_COMMANDS:
            return {...state, commands: state.commands.filter(v => !action.payload.includes(v.id))}
        case actions.SET_PLAYER_ROLE:
            return {...state, playerRole: action.payload}
        case actions.UPDATE_STATS:
            return {...state, ...action.payload}
        default:
            return state
    }
}