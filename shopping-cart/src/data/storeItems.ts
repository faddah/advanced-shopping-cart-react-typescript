/**
 * Validated store items with runtime type checking
 * This ensures items.json has the correct structure at application startup
 */

import rawItems from "./items.json";
import { validateStoreItems, type StoreItem } from "../utilities/typeGuards";

// Validate the imported data and export it
// This will throw an error at startup if items.json is invalid
export const storeItems: StoreItem[] = validateStoreItems(rawItems);

// For backwards compatibility, also export as default
export default storeItems;
