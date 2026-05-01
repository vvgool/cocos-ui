import type { VNode } from './jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    View: any;
    Label: any;
    Button: any;
    Sprite: any;
    ScrollView: any;
    Layout: any;
    VBox: any;
    HBox: any;
    Toggle: any;
    Slider: any;
    ProgressBar: any;
    EditBox: any;
    RichText: any;
    PageView: any;
    Mask: any;
    Graphics: any;
    SafeArea: any;
    Widget: any;
    Particle2D: any;
    Placeholder: any;
    Fragment: any;
  }

  interface Element extends VNode {}
  interface ElementClass {}
  interface ElementAttributesProperty { props: any }
  interface ElementChildrenAttribute { children: any }
}

declare module 'cocos-ui/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      View: any;
      Label: any;
      Button: any;
      Sprite: any;
      ScrollView: any;
      Layout: any;
      VBox: any;
      HBox: any;
      Toggle: any;
      Slider: any;
      ProgressBar: any;
      EditBox: any;
      RichText: any;
      PageView: any;
      Mask: any;
      Graphics: any;
      SafeArea: any;
      Widget: any;
      Particle2D: any;
      Placeholder: any;
      Fragment: any;
    }

    interface Element extends VNode {}
    interface ElementClass {}
    interface ElementAttributesProperty { props: any }
    interface ElementChildrenAttribute { children: any }
  }
}

export {};