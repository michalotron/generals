import React, { useState } from 'react'
import { historySelector, historyUserColorsSelector } from '../storage/history/history.selector'
import { useSelector } from 'react-redux'
import styles from './BattleHistory.module.scss'
import Board from '../Game/Board'
import { Slider, Button } from 'antd'
import { DoubleLeftOutlined, BackwardOutlined, CaretLeftOutlined, CaretRightOutlined, FastForwardOutlined, DoubleRightOutlined } from '@ant-design/icons';
import useRefState from '../hooks/useRefState'


export default () => {
    const history = useSelector(historySelector)
    const historyUserColors = useSelector(historyUserColorsSelector)
    const [tourIndex, tourIndexRef, setTourIndex] = useRefState(0)
    const [board, setBoard] = useState(history[0])
    const [speed, speedRef, setSpeed] = useRefState(25)
    const [isAutoPlay, isAutoPlayRef, setIsAutoPlay] = useRefState(false)

    const updateBoard = (tourIndex) => {
        setTourIndex(tourIndex)
        setBoard(history[tourIndex])
    }

    const incrementBoard = () => {
        if(!history[tourIndexRef.current + 1]) {
            return false
        }
        updateBoard(tourIndexRef.current + 1)
        return true
    }

    const rewindBack = (frames) => {
        const nextBoardIndex = tourIndexRef.current - frames
        updateBoard(nextBoardIndex < 0 
            ? 0 
            : nextBoardIndex
        )
    }

    const rewindForward = (frames) => {
        const nextBoardIndex = tourIndexRef.current + frames
        updateBoard(nextBoardIndex >= history.length 
                        ? (history.length - 1) 
                        : nextBoardIndex
        )
    }


    const autoFrma = (init) => {
        if((init || isAutoPlayRef.current) && incrementBoard()) setTimeout(() => {
            autoFrma()
        }, 1000 / speedRef.current)
    }
    
    return (
        <>
            <div className={styles['speed-slider']}>
                <Slider
                    max={100}
                    min={1}
                    step={1}
                    value={speed}
                    onChange={setSpeed}
                />
                <div>
                    Speed x {speed}
                </div>
                <div>
                    <Button
                        icon={<DoubleLeftOutlined />}
                        onClick={() => rewindBack(40)}
                    />
                    <Button
                        icon={<BackwardOutlined/>}
                        onClick={() => rewindBack(20)}
                    />
                    <Button
                        icon={<CaretLeftOutlined />}
                        onClick={() => rewindBack(10)}
                    />
                    {
                        !isAutoPlay &&
                        <Button
                            type="primary"
                            onClick={() => {
                                setIsAutoPlay(true)
                                autoFrma(true)
                            }}
                        >
                            Auto Play
                        </Button>
                    }
                    {
                        isAutoPlay &&
                        <Button
                            type="primary"
                            onClick={() => setIsAutoPlay(false)}
                        >
                            Pause
                        </Button>
                    }
                    <Button
                        icon={<CaretRightOutlined />}
                        onClick={() => rewindForward(10)}
                    />
                    <Button
                        icon={<FastForwardOutlined />}
                        onClick={() => rewindForward(20)}
                    />                
                    <Button
                        icon={<DoubleRightOutlined />}
                        onClick={() => rewindForward(40)}
                    />                
                </div>
            </div>
            {
                board &&
                <Board
                    overridedBoard={board}
                    overridedUserColors={historyUserColors}
                />
            }
        </>
    )
}