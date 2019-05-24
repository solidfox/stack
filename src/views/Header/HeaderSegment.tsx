import * as React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import HeaderTitle from './HeaderTitle';
import HeaderBackButton from './HeaderBackButton';
import memoize from '../../utils/memoize';
import { Route, Layout, HeaderStyleInterpolator } from '../../types';

export type Scene<T> = {
  route: T;
  progress: Animated.Node<number>;
};

type Props<T extends Route> = {
  layout: Layout;
  onGoBack?: () => void;
  getTitle: (props: { route: T }) => string | undefined;
  scene: Scene<T>;
  previous?: Scene<T>;
  next?: Scene<T>;
  styleInterpolator: HeaderStyleInterpolator;
  style?: StyleProp<ViewStyle>;
};

type State = {
  titleLayout?: Layout;
  backTitleLayout?: Layout;
};

export default class HeaderSegment<T extends Route> extends React.Component<
  Props<T>,
  State
> {
  state: State = {};

  private handleTitleLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;

    this.setState({ titleLayout: { height, width } });
  };

  private handleBackTitleLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;

    this.setState({ backTitleLayout: { height, width } });
  };

  private getInterpolatedStyle = memoize(
    (
      styleInterpolator: HeaderStyleInterpolator,
      layout: Layout,
      current: Animated.Node<number>,
      next: Animated.Node<number> | undefined,
      titleLayout: Layout | undefined,
      backTitleLayout: Layout | undefined
    ) =>
      styleInterpolator({
        positions: {
          current,
          next,
        },
        layouts: {
          screen: layout,
          title: titleLayout,
          backTitle: backTitleLayout,
        },
      })
  );

  render() {
    const {
      scene,
      previous,
      next,
      layout,
      onGoBack,
      getTitle,
      styleInterpolator,
      style,
    } = this.props;

    const { backTitleLayout, titleLayout } = this.state;
    const currentTitle = getTitle({ route: scene.route });
    const previousTitle = previous
      ? getTitle({ route: previous.route })
      : undefined;

    const {
      titleStyle,
      leftButtonStyle,
      backTitleStyle,
    } = this.getInterpolatedStyle(
      styleInterpolator,
      layout,
      scene.progress,
      next ? next.progress : undefined,
      titleLayout,
      previousTitle ? backTitleLayout : undefined
    );

    return (
      <View style={[styles.container, style]}>
        {onGoBack ? (
          <Animated.View style={[styles.left, leftButtonStyle]}>
            <HeaderBackButton
              onPress={onGoBack}
              title={previousTitle}
              titleStyle={backTitleStyle}
              onTitleLayout={this.handleBackTitleLayout}
              layout={layout}
            />
          </Animated.View>
        ) : null}
        {currentTitle ? (
          <HeaderTitle
            onLayout={this.handleTitleLayout}
            style={[
              styles.title,
              Platform.select({
                ios: null,
                default: { left: onGoBack ? 72 : 16 },
              }),
              titleStyle,
            ]}
          >
            {currentTitle}
          </HeaderTitle>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  title: Platform.select({
    ios: {},
    default: { position: 'absolute' },
  }),
});
