import { useState } from "react";

const useQuestions = () => {
  const [gembaQuestions, setGembaQuestions] = useState([
    {
      id: 1,
      area: "ALL AREAS",
      question: "Uniforms are worn correctly and in good condition",
    },
    {
      id: 2,
      area: "ALL AREAS",
      question: "Safety Blade found unattended",
    },
    {
      id: 3,
      area: "ALL AREAS",
      question: "X-Ray and Metal Detectors are functioning",
    },
    {
      id: 4,
      area: "ALL AREAS",
      question:
        "Hearing protection and safety glasses are being used as required",
    },
    {
      id: 5,
      area: "ALL AREAS",
      question: "Hairnets and beard covers  are worn properly",
    },
    {
      id: 6,
      area: "ALL AREAS",
      question:
        "No jewelry (earrings, necklaces, watches, rings, etc) worn in production areas",
    },
    {
      id: 7,
      area: "ALL AREAS",
      question:
        "No evidence of food, drink, tobacco in any area other than designated areas",
    },
    {
      id: 8,
      area: "ALL AREAS",
      question: "Components stored in closed containers",
    },
    {
      id: 9,
      area: "ALL AREAS",
      question: "Curtains to primary rooms are closed",
    },
    {
      id: 10,
      area: "ALL AREAS",
      question:
        "Equipment, cleaning utensils & chemicals are clean and stored in correct location",
    },
    {
      id: 11,
      area: "ALL AREAS",
      question: "Documentation appropriately handled and stored",
    },
    {
      id: 12,
      area: "ALL AREAS",
      question: "Bins are properly updated",
    },
    {
      id: 13,
      area: "ALL AREAS",
      question:
        "Are finished products and containers clearly labeled to identify product and lot number",
    },
    {
      id: 14,
      area: "ALL AREAS",
      question:
        "Are in-process materials/components clearly identified and correct version is assigned",
    },
    {
      id: 15,
      area: "ALL AREAS",
      question: "Main isles are clean and free of obstructions",
    },
    {
      id: 16,
      area: "ALL AREAS",
      question:
        "Floors are clear of spills, chemical residue and debris (Pallet chips)",
    },
    {
      id: 17,
      area: "ALL AREAS",
      question:
        "Fire extinguishers, electrical panels, emergency equipment are accessible",
    },
    {
      id: 18,
      area: "ALL AREAS",
      question: "No oil or grease leaking by machines in production area",
    },
    {
      id: 19,
      area: "ALL AREAS",
      question: "All chemical containers are clearly labeled",
    },
    {
      id: 20,
      area: "ALL AREAS",
      question:
        "Area waste bins are not over flowing and are used for appropriate materials only",
    },
    {
      id: 21,
      area: "ALL AREAS",
      question: "Pallet Jacks are parked in designated locations",
    },
    {
      id: 22,
      area: "ALL AREAS",
      question: "Empty pallets stored in designated area and lying flat",
    },
    {
      id: 23,
      area: "ALL AREAS",
      question: "Safety signs are clearly visible",
    },
    {
      id: 24,
      area: "ALL AREAS",
      question: "Cleaning room is organized and tidy",
    },
    {
      id: 25,
      area: "ALL AREAS",
      question: "The bobbins that come with the machine are correctly located.",
    },
    {
      id: 26,
      area: "PILLOW",
      question:
        "The space between one machine and another is the most optimal.",
    },
    {
      id: 27,
      area: "PILLOW",
      question: "The boxes for the rejection metal detectors are always empty.",
    },
    {
      id: 28,
      area: "PILLOW",
      question: "The boxes for the rejection weight checker are always empty.",
    },
    {
      id: 29,
      area: "PILLOW",
      question:
        "The products arrive at the machine with correct identification.",
    },
    {
      id: 30,
      area: "PILLOW",
      question:
        "At the start of the shift, the floor is clean and the trash is properly disposed of.",
    },
    {
      id: 31,
      area: "PILLOW",
      question:
        "The beige plastic bins used to store products appear clean and organized.",
    },
    {
      id: 32,
      area: "PILLOW",
      question: "The cables are properly organized.",
    },
    {
      id: 33,
      area: "AUTOMATION",
      question:
        "The large bins that hold products and feed the machines appear clean.",
    },
    {
      id: 34,
      area: "AUTOMATION",
      question:
        "The cover on the large bins, where the product is opened, is in perfect condition.",
    },
    {
      id: 35,
      area: "AUTOMATION",
      question:
        "The small containers used to store the product are in good condition.",
    },
    {
      id: 36,
      area: "AUTOMATION",
      question: "The hand packing area (HP5 - HP6-HP7) is properly organized.",
    },
    {
      id: 37,
      area: "NEW AUTOMATION",
      question:
        "The sacks containing the product are stacked on wooden pallets in perfect condition.",
    },
    {
      id: 38,
      area: "NEW AUTOMATION",
      question: "The cables are properly organized.",
    },
    {
      id: 39,
      area: "NEW AUTOMATION",
      question:
        "The storage space for freshly packed products from the machine is optimized.",
    },
    {
      id: 40,
      area: "ROASTING",
      question:
        "There is a designated area for opening products that arrive in boxes.",
    },
    {
      id: 41,
      area: "ROASTING",
      question:
        "We always keep sacks, boxes, and utensils for the machine organized.",
    },
    {
      id: 42,
      area: "ROASTING",
      question:
        "The work table only contains papers and utensils necessary for filling out the information.",
    },
    {
      id: 43,
      area: "MIXING",
      question:
        "Utensils such as blenders, weights, jars, and transparent bags are clean and organized.",
    },
    {
      id: 44,
      area: "MIXING",
      question: 'There is a designated area for "storing" probiotics.',
    },
    {
      id: 45,
      area: "MIXING",
      question:
        "Below the mixing platforms, the area is free of boxes, cartons, and products.",
    },
    {
      id: 46,
      area: "MIXING",
      question:
        "The Batch Record MIXING staff's desks are free of clutter, such as bags, old labels, and disorganized papers.",
    },
  ]);

  return { gembaQuestions };
};

export default useQuestions;
