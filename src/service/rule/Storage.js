import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Storage",
    description: "Rules for permanent guild storage.",
    emoji: "📦",
    colour: "#e59539",
    rules: [
        new CustomCommandRule({
            id: "9d411a06-540e-4681-956d-9525c884617c",
            name: "Create collection %",
            description: "Create a storage collection for the guild.",
            params: ["string"],
            callback: async function CreateStorageCollection(name) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    storage.createCollection(name);

                    await storage.save();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "8bf25875-5e4c-4172-b9f2-7db9d327f10c",
            name: "Clear collection %",
            description: "Clear a storage collection.",
            params: ["string"],
            callback: async function ClearCollection(name) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    const collection = storage.collections.get(name);

                    if (collection) {
                        collection.clear();

                        await storage.save();
                    }
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "73c28311-b12a-471b-b501-d44903b148f5",
            name: "Delete collection %",
            description: "Delete a storage collection.",
            params: ["string"],
            callback: async function DeleteCollection(name) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    const collection = storage.collections.get(name);

                    if (collection) {
                        collection.delete();

                        await storage.save();
                    }
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "2624943f-dacd-4d37-8a40-d8c3b46b2905",
            name: "Item % in %",
            description: "Get an item in a storage collection.",
            params: ["string", "string"],
            callback: async function GetCollectionItem(item, name) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    const collection = storage.collections.get(name);

                    if (collection) {
                        return collection.items.get(item).value;
                    }
                }
            },
            fallback: null,
            returns: "string"
        }),
        new CustomCommandRule({
            id: "d028cb31-bff7-4950-bf94-2be88832aece",
            name: "Set item % in % to %",
            description: "Set an item in a storage collection.",
            params: ["string", "string", "string"],
            callback: async function GetCollectionItem(item, name, val) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    const collection = storage.collections.get(name);

                    if (collection) {
                        collection.set(item, val);
                        
                        await storage.save();
                    }
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "d5bf0083-26c2-4fbc-9b1e-46b75bc6bc5d",
            name: "Delete item % in % to %",
            description: "Set an item in a storage collection.",
            params: ["string", "string", "string"],
            callback: async function SetCollectionItem(item, name, val) {
                const service = this.client.StorageService;
                const storage = await service.getStorage(this.guild);

                if (storage) {
                    const collection = storage.collections.get(name);

                    if (collection) {
                        collection.deleteItem(item);

                        await storage.save();
                    }
                }
            },
            returns: "void"
        })
    ]
});