import chess from "chess.js"
import fs from "fs/promises"

function determine_opening_colour(opening, i, arr) {
	const max = arr.length;
	const num = i + 1;
	const fmt = "(" + num + "/" + max + ")";
	
	console.log("[I] " + fmt + " Determining colour for opening " + opening.name + "..");
	
	const complete_game = new chess.Chess;
	const sloppy_moves = opening.moves.split(" ");

	for (let i = 0; i < sloppy_moves.length; i++) {
		complete_game.move(sloppy_moves[i], { sloppy: true });
	}

	const moves = complete_game.history();
	const colour = moves.length % 2 > 0 ? "White" : "Black";
	
	console.log("[I] " + fmt + " Colour " + colour + ".");
	
	return colour;
}

function is_valid(opening) {
	return opening.eco && typeof opening.eco === "string" && opening.eco.length === 3 &&
		opening.name && typeof opening.name === "string" &&
		opening.fen && typeof opening.fen === "string" &&
		opening.moves && typeof opening.moves === "string" && /^(([a-h][0-8]){2} ?)+$/.test(opening.moves);
}

(async function __main(argv) {
	const __START = Date.now();
	
	console.log("[I] Process started at " + new Date(__START).toISOString() + ".");
		
	try {
		console.log("[I] Opening file..");
		
		const openings = JSON.parse(await fs.readFile(argv[0] || "lib/openings.json"));
		
		console.log("[I] Opened file.");
		
		const fixed = openings.filter(is_valid).map((opening, i, arr) => {
			if (openings.filter(({ name }, j) => name === opening.name && j !== i).length) {
				opening.name += " (" + determine_opening_colour(opening, i, arr) + ")";
			} else {
				const max = arr.length;
				const num = i + 1;
				console.log("[I] (" + num + "/" + max + ") Skipping " + opening.name + "..");
			}

			return opening;
		});
		
		console.log("[I] Saving file..");
		
		await fs.writeFile(argv[0] || "lib/openings.json", JSON.stringify(fixed));
		
		console.log("[I] Saved file.");
	} catch (e) {
		if (e.code) {
			console.error("[E] Could not open file " + (argv[0] || lib/openings.json), e);
		}
		
		console.error(e);
	}
	
	const __END = Date.now();
	
	console.log("[I] Process ended at " + new Date(__START).toISOString() + ". (" + Math.floor((__END - __START) / 1000) + "s)");
})(process.argv.slice(2));