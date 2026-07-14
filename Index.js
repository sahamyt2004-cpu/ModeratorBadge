// LocalOnlyBadgeSwitcher - shows a client-side only "Moderator (local)" badge.
// This does NOT call Discord APIs to grant any real moderator privileges or badges.
(function(_, commands, metro, toasts, common, plugin, storage, assets) {
  "use strict";

  const { ScrollView } = metro.findByProps("ScrollView");
  const { TableRowGroup, TableRow, Stack } = metro.findByProps("TableSwitchRow","TableCheckboxRow","TableRowGroup","Stack","TableRow");
  const React = _.React || require('react');

  // Local badge options (purely client-side labels/icons)
  const BADGES = [
    { id: 0, name: "None", description: "No local badge" },
    { id: 1, name: "Moderator (local)", description: "Client-only display. Not an official Discord badge." },
    { id: 2, name: "Custom Tester", description: "Client-only custom badge for testing" }
  ];

  // Use Vendetta storage proxy if available
  plugin.useProxy && plugin.useProxy(storage);

  function setLocalBadge(id) {
    // store locally; this does NOT interact with Discord's servers or API
    storage.localBadge = id;
    const choice = BADGES.find(b => b.id === id);
    toasts.showToast(choice ? `Local badge set: ${choice.name}` : "Local badge removed", assets.getAssetIDByName(choice ? "Check" : "Small"));
  }

  function SettingsView() {
    const nav = _.NavigationNative ? _.NavigationNative.useNavigation() : { goBack: () => {} };
    const current = BADGES.find(b => b.id === storage.localBadge) || BADGES[0];

    return React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 10 } },
      React.createElement(Stack, { spacing: 8 },
        React.createElement(TableRowGroup, { title: "Local Badge" },
          BADGES.map(b =>
            React.createElement(TableRow, {
              key: b.id,
              label: b.name,
              subLabel: b.description,
              onPress: () => {
                setLocalBadge(b.id);
                nav.goBack();
              }
            })
          )
        ),
        React.createElement(TableRowGroup, { title: "Information" },
          React.createElement(TableRow, {
            label: "Current Local Badge",
            subLabel: current ? `${current.name} — ${current.description}` : "None"
          })
        )
      )
    );
  }

  // Command: /localbadge <id>
  async function handleCommand(args) {
    const raw = args?.[0]?.value ?? args?.[0];
    const n = Number(raw);
    if (!Number.isInteger(n) || !BADGES.some(b => b.id === n)) {
      toasts.showToast("Use 0,1,2 for local badge", assets.getAssetIDByName("Small"));
      return;
    }
    setLocalBadge(n);
  }

  const register = function() {
    commands.registerCommand({
      name: "localbadge",
      description: "Set a client-only badge: 0 none | 1 Moderator (local) | 2 Custom Tester",
      options: [{ name: "id", description: "0/1/2", type: 4, required: true }],
      execute: (e) => handleCommand(e)
    });
  };

  const unregister = function() {
    commands.unregisterAllCommands && commands.unregisterAllCommands();
  };

  const pluginObj = {
    onLoad() { register(); },
    onUnload() { unregister(); },
    settings: SettingsView
  };

  _ = pluginObj;
  module.exports = _;
  Object.defineProperty(exports, "__esModule", { value: true });
})(exports, vendetta.commands, vendetta.metro, vendetta.ui.toasts, vendetta.metro.common, vendetta.plugin, vendetta.storage, vendetta.ui.assets);
