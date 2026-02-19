import { useEffect, useRef, useState } from 'react';

export interface GamepadState {
  axes: number[];
  buttons: boolean[];
  connected: boolean;
}

export function useGamepad(onUpdate?: (gp: Gamepad) => void) {
  const [gamepad, setGamepad] = useState<GamepadState>({
    axes: [0, 0, 0, 0],
    buttons: new Array(16).fill(false),
    connected: false,
  });

  const requestRef = useRef<number>(null);
  const onUpdateRef = useRef(onUpdate);
  const stateRef = useRef<GamepadState>(gamepad);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const updateGamepadState = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];

    if (gp) {
      if (onUpdateRef.current) {
        onUpdateRef.current(gp);
      }

      const buttonsChanged = gp.buttons.some((b, i) => b.pressed !== stateRef.current.buttons[i]);
      const connectionChanged = !stateRef.current.connected;

      if (buttonsChanged || connectionChanged) {
        const newState = {
          axes: [...gp.axes],
          buttons: gp.buttons.map((b) => b.pressed),
          connected: true,
        };
        stateRef.current = newState;
        setGamepad(newState);
      }
    } else if (stateRef.current.connected) {
      const disconnectedState = {
        axes: [0, 0, 0, 0],
        buttons: new Array(16).fill(false),
        connected: false,
      };
      stateRef.current = disconnectedState;
      setGamepad(disconnectedState);
    }

    requestRef.current = requestAnimationFrame(updateGamepadState);
  };

  useEffect(() => {
    const handleConnected = () => {
      console.log('Gamepad connected');
    };

    const handleDisconnected = () => {
      console.log('Gamepad disconnected');
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    requestRef.current = requestAnimationFrame(updateGamepadState);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
    };
  }, []);

  return gamepad;
}
