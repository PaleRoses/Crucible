'use client';

import React from 'react';
// Adjust the import path based on your project structure
// Assuming DrawerInterface is exported as default from its file
import DrawerInterface from '../../../../components/navbars/doubledrawer'; // Adjust path to your DrawerInterface component

// --- TypeScript Interfaces (Copied from DrawerInterface for clarity, or import them) ---
// You might want to import these from where they are defined if shared
interface SecondaryItem {
  id: string;
  name: string;
}

interface PrimaryItem {
  id: string;
  name: string;
  secondary: SecondaryItem[];
}

interface ItemDetail {
  title: string;
  content: string;
}

type ItemDetails = Record<string, ItemDetail>;


// --- Data Definitions (Directly in DrawerInterface format) ---

// Define Primary Items for the Drawer
const drawerPrimaryItems: PrimaryItem[] = [
    {
      id: 'weapons', // Unique ID for the primary item
      name: 'WEAPONS', // Name displayed in the primary list
      secondary: [ // Each primary item has secondary items
          { id: 'weapons_details', name: 'Details' } // ID and name for the secondary item
      ]
    },
    {
      id: 'armor',
      name: 'ARMOR',
      secondary: [
          { id: 'armor_details', name: 'Details' }
      ]
    },
    {
      id: 'potions',
      name: 'POTIONS',
      secondary: [
          { id: 'potions_details', name: 'Details' }
      ]
    },
    {
      id: 'artifacts',
      name: 'ARTIFACTS',
      secondary: [
          { id: 'artifacts_details', name: 'Details' }
      ]
    },
    {
      id: 'accessories',
      name: 'ACCESSORIES',
      secondary: [
          { id: 'accessories_details', name: 'Details' }
      ]
    },
];

// Define Item Details, mapping secondary item IDs to their content
const drawerItemDetails: ItemDetails = {
    'weapons_details': { // Key matches the secondary item ID
        title: 'WEAPONS OF RENOWN', // Title for the content display
        content: // Content string (paragraphs joined by double newline)
            "From gleaming longswords blessed by celestial light to shadowy daggers coated in potent venom, the right weapon is an extension of the warrior's will. Choose wisely, for your life often depends on the quality of your steel and the sharpness of your edge.\n\n" +
            "Legendary blades whisper tales of past heroes, while enchanted bows strike true from afar. Even a simple staff, wielded by a master, can channel devastating arcane energies."
    },
    'armor_details': {
        title: 'ARMOR & DEFENSES',
        content:
            "Protection comes in many forms. Plate mail forged in dwarven halls offers unparalleled defense, while elven chainmail provides agility and silence. Robes woven with protective runes deflect hostile magic, and sturdy shields turn aside monstrous claws.\n\n" +
            "Consider the weight, the material, and any enchantments. A hero clad in appropriate armor can withstand blows that would fell lesser folk."
    },
    'potions_details': {
        title: 'POTIONS & ALCHEMY',
        content:
            "The alchemist's art captures potent magic in liquid form. Vials of crimson liquid restore vitality, shimmering blue concoctions replenish magical reserves, and murky brews grant temporary invisibility or Herculean strength.\n\n" +
            "Handle with care, for some potions have volatile side effects, and misidentification can lead to disastrous results. Always trust a reputable supplier... if you can find one."
    },
    'artifacts_details': {
        title: 'ARTIFACTS & RELICS',
        content:
            "Objects of immense power, relics from forgotten ages, or items imbued with the essence of gods and demons. Artifacts defy simple categorization, offering unique and often unpredictable abilities.\n\n" +
            "An Orb of Dragonkind commands respect, a Deck of Many Things tempts fate, and a simple Amulet of Proof against Detection and Location can mean the difference between success and capture. Seek them, but beware their influence."
    },
    'accessories_details': {
        title: 'RINGS, AMULETS & MORE',
        content:
            "Beyond the core gear lie items that enhance, protect, or provide utility. Rings of Spell Storing hold arcane power, Boots of Speed grant swift passage, and Cloaks of Elvenkind conceal the wearer.\n\n" +
            "Amulets ward off curses, gauntlets enhance strength, and magical quivers never run empty. These smaller items often provide the crucial edge needed for survival."
    },
};


/**
 * EquipmentPage Component
 * Displays fantasy equipment categories using the DrawerInterface layout.
 * Data is defined directly in the format required by DrawerInterface.
 */
export default function EquipmentPage() {
  // Data is already in the correct format, no transformation needed.

  return (
    // Render the DrawerInterface component
    <DrawerInterface
        primaryItems={drawerPrimaryItems} // Pass the directly defined primary items
        secondaryItemDetails={drawerItemDetails} // Pass the directly defined item details
        // initialMode="split" // Default is 'split', uncomment to change
    />
  );
}
