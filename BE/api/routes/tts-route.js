import { Router } from "express";
import { generateSpeech, getVoices } from "../controllers/tts-controller.js";

const router = Router();

router.get("/voices", getVoices);
router.post("/speak", generateSpeech);

export default router;
