import {useEffect, useRef, useState} from 'react';
import * as React from "react";

const Home = () => {
    interface PosProps{
        x: number;
        y: number;
        lastX: number;
        lastY: number;
        color: string;
    }

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [lastPosition, setLastPosition] = useState({x: 0, y: 0});
    const [pixels, setPixels] = useState<PosProps[]>([]);
    const [color, setColor] = useState('#000000');

    const ws = useRef<WebSocket | null>(null);


    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/paint');

        if ("onmessage" in ws.current) {
            ws.current.onmessage = (message) => {
                const decodedMessage = JSON.parse(message.data)

                if (decodedMessage.type === 'pixel') {
                    setPixels((prevPixels) => [...prevPixels, decodedMessage.data]);
                }
            };
        }

        return () => {
            ws.current?.close();
        };
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return null;
        }

        const canvasContext = canvas?.getContext('2d');

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        pixels.forEach(({ x, y, lastX, lastY, color }) => {
            canvasContext.beginPath();
            canvasContext.strokeStyle = color;
            canvasContext.moveTo(lastX, lastY);
            canvasContext.lineTo(x, y);
            canvasContext.stroke();
        });
    }, [pixels]);

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const {offsetX, offsetY, type} = e.nativeEvent;

        if (type === 'mousedown') {
            setIsActive(true);
            setLastPosition({x: offsetX, y: offsetY});
        }

        if (type === 'mousemove' && isActive) {
            const pixelPosData = {
                x: offsetX,
                y: offsetY,
                lastX: lastPosition.x,
                lastY: lastPosition.y,
                color,
            };

            if ("send" in ws.current) {
                ws.current.send(JSON.stringify({type: 'pixel', data: pixelPosData}));
            }

            setPixels((pixelPos) => [...pixelPos, pixelPosData]);
            setLastPosition({ x: offsetX, y: offsetY });
        }

        if (type === 'mouseup') {
            setIsActive(false);
        }
    };

    return (

        <div style={{display:'flex', flexDirection:'column', marginTop:'50px'}}>
            <div style={{display:'flex'}}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{border: '1px solid black', backgroundColor: 'white'}}
                    onMouseDown={draw}
                    onMouseMove={draw}
                    onMouseUp={draw}
                    onMouseLeave={draw}
                />
                <div style={{marginLeft:'50px'}}>
                    {ws.current && (
                        <div>
                            <div>Вы подключены</div>
                        </div>
                    )}
                    <h1>Выбрать цвет линии</h1>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{marginBottom: '20px', width:'200px'}}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;