import { putObject } from "../utils/putObject.js";

// @ts-ignore
const uploadVideo = async (req, res) => {
  try {
    const { videoTitle, videoURL } = req.body;

    if (!videoTitle || !videoURL) {
      return res
        .status(400)
        .json({ error: "videoTitle and videoURL are required" });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "Video file is required" });
    }
    const { file } = req.files;
    const { url, key } = await putObject(file, videoTitle);
    return res.status(200).json({
      url,
      key,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
