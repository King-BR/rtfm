/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/* Build a page's dialog from page.content, a small subset of markdown */

(() => {

const addSection = (table, section, size) => {
	const text = table.add("[stat]" + section).growX().center().padTop(16).get();
	text.setAlignment(Align.center);
	const textwidth = text.prefWidth;

	/* Underline */
	table.row();
	table.addImage().color(Pal.stat).height(2 + 2 * size)
		.width(textwidth).center().padBottom(16);
};

/* Add image in the format {texture[:size]} */
const addImage = (table, str) => {
	const matched = str.match(/^([\w-]+)\s*:\s*(\d+)$/);
	const name = matched ? matched[1] : str;
	const region = Core.atlas.find(name);
	const size = matched ? matched[2] : region.height;

	table.addImage(region).left().top()
		.height(size).width(size * (region.width / region.height));
};

module.exports = page => {
	const table = new Table();
	table.left().margin(32);
	table.defaults().left();
	const pane = new ScrollPane(table);
	page.dialog.cont.add(pane).grow();
	Core.app.post(run(() => Core.scene.setScrollFocus(pane)));

	for (var i in page.content) {
		var line = page.content[i];
		table.row();

		/* Custom elements */
		if (typeof(line) != "string") {
			table.add(line);
			continue;
		}

		// [^] = lua and maybe c regex ".", match ALL characters, even evil newlines.
		var section = line.match(/^(#+)\s*([^]+)/);
		if (section) {
			addSection(table, section[2], section[1].length);
			continue;
		}

		/* Check for images */
		while (true) {
			var image = line.match(/^([^]+?)?\{([\w-]+(?::\d+)?)\}([^]*)$/)
			if (!image) break;

			var before = image[1], img = image[2], after = image[3];
			if (before) {
				table.add(before).get().setWrap(true);
			}

			addImage(table, img);
			line = after;
		}

		if (line) {
			table.add(line).get().setWrap(true);
		}
	}
};

})();
