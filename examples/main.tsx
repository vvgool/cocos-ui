/// <reference types="vite/client" />

import { render, useState, View, Label } from 'cocos-ui';

function App() {
  const [count, setCount] = useState(0);

  return (
    <View width={960} height={640} backgroundColor="#1a1a2e">
      <View
        width={400}
        height={200}
        x={480}
        y={320}
        anchorX={0.5}
        anchorY={0.5}
        backgroundColor="#16213e"
        borderRadius={12}
      >
        <Label
          text="cocos-ui"
          fontSize={36}
          color="#e94560"
          x={200}
          y={140}
          anchorX={0.5}
          anchorY={0.5}
        />
        <Label
          text={`Count: ${count()}`}
          fontSize={24}
          color="#e0e0e0"
          x={200}
          y={80}
          anchorX={0.5}
          anchorY={0.5}
        />
        <View
          width={160}
          height={44}
          x={200}
          y={30}
          anchorX={0.5}
          anchorY={0.5}
          backgroundColor="#e94560"
          borderRadius={8}
          onClick={() => setCount(count() + 1)}
        >
          <Label
            text="Click me"
            fontSize={20}
            color="#ffffff"
            x={80}
            y={22}
            anchorX={0.5}
            anchorY={0.5}
          />
        </View>
      </View>
    </View>
  );
}

export function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const game = new cc.Game();
  game.init({
    debugMode: cc.DebugMode.INFO,
    showFPS: true,
    frameRate: 60,
  }).then(() => {
    const scene = new cc.Scene('main');
    game.runScene(scene);

    render(<App />, scene);
  });
}