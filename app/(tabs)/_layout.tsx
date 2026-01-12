import { DynamicColorIOS } from "react-native";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

// Set initial route for this tab group
export const unstable_settings = {
  initialRouteName: "friends",
};

/**
 * Native tab navigator with iOS 26+ Liquid Glass effect.
 * Uses UITabBarController on iOS for true native behavior.
 * Routes: index (Journal), friends, settings
 */
export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={DynamicColorIOS({ dark: "white", light: "black" })}
      labelStyle={{
        color: DynamicColorIOS({ dark: "white", light: "black" }),
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Journal</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="friends">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Friends</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
