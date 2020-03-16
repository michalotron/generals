import { generateMap } from "./mapUtils"


const getNextCoordinates = (from, direction) => {
    let x = from.x
    let y = from.y

    if (direction === 'u') y--
    if (direction === 'd') y++
    if (direction === 'l') x--
    if (direction === 'r') x++
    return {x, y}
}

export class Game {
    UNITS_INSTANTIATION_INTERVAL = 2500
    CASTLE_INSTANTIATION_INTERVAL = 1

    constructor(players) {
        this.tourCounter = 0
        this.intervalId = null
        this.loosers = []
        this.players = players
        this.board = generateMap({
            width: 16, 
            height: 16,
            castles: 12,
            mountains: 28,
            players: players.map(v => v.socketId)
        }),
        this.moves = players.reduce((acc, user) => ({
            ...acc,
            [user.socketId]:  []
        }), {})
    }

    addCommand(socketId, command) {
        this.moves[socketId].push(command)
    }

    tic() {
        const removedCommands = {}

        this.instantiateUnits()
        Object.keys(this.moves).forEach(socketId => {
            let moves = this.moves[socketId]
            let executableIndex = moves.findIndex(v => this.isCommandExecutable(v, socketId))
            if (executableIndex >= 0) {
                this.executeCommand(moves[executableIndex], socketId)
                removedCommands[socketId] = moves
                                            .filter((v, index) => index <= executableIndex)
                                            .map(v => v.id)
                this.moves[socketId] = moves.slice(executableIndex + 1)
            } else {
                removedCommands[socketId] = moves.map(v => v.id)
                this.moves[socketId] = []
            }
        })
        this.tourCounter++

        return removedCommands
    }

    executeCommand(command, socketId) {
        switch (command.type) {
            case 'MOVE_ALL': {
                const {from, direction} = command
                const to = getNextCoordinates(from, direction)

                const fromField = this.getBoardField(from)
                const toField = this.getBoardField(to)
                const movedUnits = fromField.units - 1
                fromField.units = fromField.units - movedUnits

                if(toField.owner === fromField.owner) {
                    toField.units += movedUnits
                    return
                }

                if (toField.units < movedUnits) {
                    if (toField.type == 'capitol') {
                        this.conquerPlayer(fromField.owner, toField.owner, toField)
                    }
                    toField.owner = socketId
                }
                
                toField.units = Math.abs(toField.units - movedUnits)
                
                break;
            }
            default:
                break;
        }
    }

    instantiateUnits() {
        const ocupiedFields = this.board.flat().filter(v => v.owner != 'n')
        if (this.tourCounter % this.UNITS_INSTANTIATION_INTERVAL === 0){
            ocupiedFields.forEach(v => v.units++)
        } else if(this.tourCounter % this.CASTLE_INSTANTIATION_INTERVAL === 0) {
            ocupiedFields
                .filter(v => v.type === 'capitol' || v.type === 'castle')
                .forEach(v => v.units++)
        }
    }

    conquerPlayer(agressorId, victimId, capitolField) {
        this.loosers.push(victimId)
        this.board
            .flat()
            .filter(v => v.owner === victimId)
            .forEach(v => v.owner = agressorId)

        capitolField.type = 'castle'
    }

    isCommandExecutable(command, socketId) {
        if (command.type === 'MOVE_ALL') {
            const {from, direction} = command
                const to = getNextCoordinates(from, direction)

                const fromField = this.getBoardField(from)
                const toField = this.getBoardField(to)

                if(
                    !fromField || !toField ||
                    fromField.owner != socketId ||
                    fromField.units < 2 ||
                    toField.type === 'mountain'
                ) return false
        }

        return true
    }

    eraseCommands(socketId, commandIds) {
        this.moves[socketId] = this.moves[socketId]
                                .filter(v => !commandIds.includes(v.id))
    }

    getBoardField = ({x, y}) => this.board[y][x]
    getWinner = () => this.players.legth - this.loosers.length === 1
} 