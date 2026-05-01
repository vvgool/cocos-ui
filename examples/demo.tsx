import {
  render,
  useState,
  View,
  VBox,
  HBox,
  Label,
  Button,
  Slider,
  Toggle,
  ProgressBar,
  EditBox,
  Sprite,
  ScrollView,
  Graphics,
  SafeArea,
  Particle2D,
  errorBoundary,
  Suspense,
  shimmer,
  ThemeProvider,
  useTheme,
  lightTheme,
  darkTheme,
} from 'cocos-ui';

function CounterDemo() {
  const [count, setCount] = useState(0);

  return (
    <VBox padding={20} spacing={10}>
      <Label text="Counter Demo" fontSize={28} bold />
      <Button
        text={`Count: ${count()}`}
        onClick={() => setCount(prev => prev + 1)}
      />
      <Button
        text="Reset"
        onClick={() => setCount(0)}
      />
    </VBox>
  );
}

function LayoutDemo() {
  return (
    <VBox padding={20} spacing={15}>
      <Label text="Layout Demo" fontSize={28} bold />

      <Label text="Horizontal Layout:" fontSize={20} />
      <HBox spacing={10}>
        <Label text="Item 1" />
        <Label text="Item 2" />
        <Label text="Item 3" />
      </HBox>

      <Label text="Vertical Layout:" fontSize={20} />
      <VBox spacing={5}>
        <Label text="First" />
        <Label text="Second" />
        <Label text="Third" />
      </VBox>

      <HBox spacing={20}>
        <VBox spacing={5}>
          <Label text="A1" />
          <Label text="A2" />
        </VBox>
        <VBox spacing={5}>
          <Label text="B1" />
          <Label text="B2" />
        </VBox>
      </HBox>
    </VBox>
  );
}

function AnimationDemo() {
  const [animated, setAnimated] = useState(false);

  return (
    <VBox padding={20} spacing={15}>
      <Label text="Animation Demo" fontSize={28} bold />
      <Button
        text={animated() ? 'Stop Animation' : 'Start Animation'}
        onClick={() => setAnimated(!animated())}
      />
      <View
        width={80}
        height={80}
        color="#007aff"
        animate={
          animated()
            ? [
                { x: 100, duration: 0.5, easing: 'sineOut' },
                { x: 0, duration: 0.5, easing: 'sineIn' },
              ]
            : undefined
        }
      />
      <HBox spacing={10}>
        <View
          width={50}
          height={50}
          color="#34c759"
          animate={
            animated()
              ? { scale: 1.5, duration: 0.4, easing: 'elasticOut' }
              : undefined
          }
        />
        <View
          width={50}
          height={50}
          color="#ff9500"
          animate={
            animated()
              ? { rotation: 360, duration: 0.6, easing: 'backOut' }
              : undefined
          }
        />
      </HBox>
    </VBox>
  );
}

function BombComponent() {
  throw new Error('Boom! This component always throws.');
}

const RecoverableBomb = errorBoundary(
  BombComponent,
  <Label text="Something went wrong!" color="#ff3b30" fontSize={24} />,
);

function ErrorBoundaryDemo() {
  const [showBomb, setShowBomb] = useState(false);

  return (
    <VBox padding={20} spacing={15}>
      <Label text="Error Boundary Demo" fontSize={28} bold />
      <Button
        text={showBomb() ? 'Hide Bomb' : 'Show Bomb'}
        onClick={() => setShowBomb(!showBomb())}
      />
      {showBomb() ? <RecoverableBomb /> : <Label text="Bomb hidden" color="#34c759" />}
    </VBox>
  );
}

function ThemeDemo() {
  const theme = useTheme();

  return (
    <VBox padding={20} spacing={15}>
      <Label text="Theme Demo" fontSize={28} bold />
      <View width={200} height={80}>
        <Label
          text={`Theme: ${theme.colors?.text ?? 'default'}`}
          fontSize={18}
        />
        <Label
          text={`Primary: ${theme.colors?.primary ?? 'blue'}`}
          fontSize={14}
          color={theme.colors?.primary}
        />
      </View>
      <HBox spacing={10}>
        <View width={40} height={40} color={theme.colors?.primary} />
        <View width={40} height={40} color={theme.colors?.secondary} />
        <View width={40} height={40} color={theme.colors?.success} />
        <View width={40} height={40} color={theme.colors?.error} />
      </HBox>
    </VBox>
  );
}

function SuspenseDemo() {
  return (
    <VBox padding={20} spacing={15}>
      <Label text="Suspense & Sprite Demo" fontSize={28} bold />
      <Suspense fallback={shimmer({ width: 200, height: 150 })}>
        <Sprite src="https://example.com/slow-image.png" width={200} height={150} />
      </Suspense>
      <Label text="Loading placeholder shown while image loads" fontSize={14} color="#666666" />
    </VBox>
  );
}

function InteractiveDemo() {
  const [sliderVal, setSliderVal] = useState(50);
  const [toggleOn, setToggleOn] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <VBox padding={20} spacing={15}>
      <Label text="Interactive Components" fontSize={28} bold />

      <HBox spacing={10}>
        <Label text="Slider:" />
        <Slider
          value={sliderVal() / 100}
          onChange={(val: number) => setSliderVal(Math.round(val * 100))}
        />
        <Label text={`${sliderVal()}%`} />
      </HBox>

      <HBox spacing={10}>
        <Label text="Toggle:" />
        <Toggle
          checked={toggleOn()}
          onChange={(on: boolean) => setToggleOn(on)}
        />
        <Label text={toggleOn() ? 'ON' : 'OFF'} />
      </HBox>

      <HBox spacing={10}>
        <Label text="Progress:" />
        <ProgressBar progress={progress() / 100} width={150} height={20} />
        <Button
          text="+10%"
          onClick={() => setProgress(Math.min(100, progress() + 10))}
        />
      </HBox>

      <HBox spacing={10}>
        <Label text="Input:" />
        <EditBox
          value="Enter text..."
          width={200}
          height={40}
          placeholder="Type here"
        />
      </HBox>
    </VBox>
  );
}

function ParticleDemo() {
  return (
    <VBox padding={20} spacing={15}>
      <Label text="Particle Demo" fontSize={28} bold />
      <Particle2D
        file="res/particles/plist.json"
        width={200}
        height={200}
        playOnLoad={true}
        loop={true}
      />
      <Label text="Particle system with configured plist" fontSize={14} color="#666666" />
    </VBox>
  );
}

function GraphicsDemo() {
  return (
    <VBox padding={20} spacing={15}>
      <Label text="Graphics Demo" fontSize={28} bold />
      <Graphics
        width={200}
        height={100}
        shapes={[
          { type: 'rect', x: 10, y: 10, w: 80, h: 60, strokeColor: '#007aff', lineWidth: 2 },
          { type: 'circle', cx: 150, cy: 40, r: 30, fillColor: '#34c759' },
        ]}
      />
    </VBox>
  );
}

function ThemeSwitcherDemo() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider
      theme={isDark() ? darkTheme : lightTheme}
    >
      <VBox padding={20} spacing={20}>
        <HBox spacing={10}>
          <Label text="Theme Switcher Demo" fontSize={28} bold />
          <Toggle
            checked={isDark()}
            onChange={(on: boolean) => setIsDark(on)}
          />
          <Label text={isDark() ? 'Dark' : 'Light'} />
        </HBox>

        <View
          width={300}
          height={100}
          color={isDark() ? '#2c2c2e' : '#f5f5f5'}
        >
          <VBox padding={10}>
            <Label
              text={`Background: ${isDark() ? '#2c2c2e' : '#f5f5f5'}`}
              color={isDark() ? '#ffffff' : '#000000'}
            />
            <Label
              text={`Text: ${isDark() ? '#ffffff' : '#000000'}`}
              color={isDark() ? '#8e8e93' : '#666666'}
            />
          </VBox>
        </View>

        <ThemedCard />
      </VBox>
    </ThemeProvider>
  );
}

function ThemedCard() {
  const theme = useTheme();
  return (
    <View
      width={280}
      height={80}
      color={theme.colors?.surface}
    >
      <VBox padding={10}>
        <Label
          text="Themed Card"
          bold
          color={theme.colors?.text}
        />
        <Label
          text="Using useTheme() hook"
          fontSize={14}
          color={theme.colors?.textSecondary}
        />
      </VBox>
    </View>
  );
}

function DemoApp() {
  return (
    <SafeArea>
      <ScrollView>
        <VBox padding={40} spacing={30}>
          <Label text="cocos-ui Component Showcase" fontSize={36} bold />
          <Label
            text="A comprehensive demo of all available components"
            fontSize={18}
            color="#666666"
          />

          <View>
            <Label text="1. Counter with useState" fontSize={24} bold color="#007aff" />
            <CounterDemo />
          </View>

          <View>
            <Label text="2. Layout System (VBox/HBox)" fontSize={24} bold color="#007aff" />
            <LayoutDemo />
          </View>

          <View>
            <Label text="3. Animation System" fontSize={24} bold color="#007aff" />
            <AnimationDemo />
          </View>

          <View>
            <Label text="4. Error Boundary" fontSize={24} bold color="#007aff" />
            <ErrorBoundaryDemo />
          </View>

          <View>
            <Label text="5. Interactive Components" fontSize={24} bold color="#007aff" />
            <InteractiveDemo />
          </View>

          <View>
            <Label text="6. Theme System" fontSize={24} bold color="#007aff" />
            <ThemeSwitcherDemo />
          </View>

          <View>
            <Label text="7. Suspense & Sprite Loading" fontSize={24} bold color="#007aff" />
            <SuspenseDemo />
          </View>

          <View>
            <Label text="8. Graphics Component" fontSize={24} bold color="#007aff" />
            <GraphicsDemo />
          </View>

          <View>
            <Label text="9. Particle System" fontSize={24} bold color="#007aff" />
            <ParticleDemo />
          </View>

          <Label text="--- End of Demo ---" fontSize={20} color="#999999" />
        </VBox>
      </ScrollView>
    </SafeArea>
  );
}

render(<DemoApp />);
