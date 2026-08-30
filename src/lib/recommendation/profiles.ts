import { z } from "zod";
import { hardwareProfileSchema, type HardwareProfile } from "./index";
const storageKey = "ai-patchbay-hardware-profiles-v1";
const profilesSchema = z.array(hardwareProfileSchema).max(12);
export function loadHardwareProfiles(storage: Storage): HardwareProfile[] { try { return profilesSchema.parse(JSON.parse(storage.getItem(storageKey) ?? "[]")); } catch { return []; } }
export function saveHardwareProfiles(storage: Storage, profiles: HardwareProfile[]) { storage.setItem(storageKey, JSON.stringify(profilesSchema.parse(profiles))); }
