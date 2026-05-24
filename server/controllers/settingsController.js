import UserSettings from '../models/UserSettings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { appearance, ai, voice, notifications, memory, workspace, apiKeys } = req.body;
    let settings = await UserSettings.findOne({ userId: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({ userId: req.user._id });
    }

    if (appearance) settings.appearance = { ...settings.appearance, ...appearance };
    if (ai) settings.ai = { ...settings.ai, ...ai };
    if (voice) settings.voice = { ...settings.voice, ...voice };
    if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
    if (memory) settings.memory = { ...settings.memory, ...memory };
    if (workspace) settings.workspace = { ...settings.workspace, ...workspace };
    if (apiKeys !== undefined) settings.apiKeys = apiKeys;

    await settings.save();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
