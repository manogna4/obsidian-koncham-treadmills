import { MarkdownView, Plugin} from 'obsidian';
const plugin_name = 'koncham-treadmills'

export default class Treadmills extends Plugin {

	onunload() {
		console.log('unloading plugin: ' + plugin_name);
	}

	async onload() {
		console.log('loading plugin: ' + plugin_name);

		this.addCommand({
			id: 'placeholder1',
			name: 'placeholder1',
			// hotkeys: [{ "modifiers": [], "key": "F16" }],
			callback: () => this.placeholder1(),
		});

		this.addCommand({
			id: 'placeholder2',
			name: 'placeholder2',
			// hotkeys: [{ "modifiers": [], "key": "F15" }],
			callback: () => this.placeholder2(),
		});

		this.addCommand({
			id: 'placeholder3',
			name: 'placeholder3',
			// hotkeys: [{ "modifiers": [], "key": "F14" }],
			callback: () => this.placeholder3(),
		});
	
	}

	placeholder1() {
		this.app.workspace.iterateRootLeaves((leaf: any) => {
			console.log(leaf.getDisplayText(), leaf.getViewState());
		});
	}

	placeholder2() {
		let var1 = this.app.workspace.activeLeaf.view.containerEl;
		console.log(var1);
	}

	placeholder3() {
		let max_char = 120
		let tags_special = ['#todo', '#curr', '#done']
		let view = this.app.workspace.activeLeaf.view;
		let file = this.app.workspace.getActiveFile();
		let file_cache = this.app.metadataCache.getFileCache(file);
		console.log(file_cache)
		let tags_all = Object.values(file_cache.tags)
		let tags_spl = tags_all.filter(item => (tags_special.includes(item.tag)))
		let tags_line_beg = tags_spl.filter(item => (item.position.start.col == 0))
		let tags_section_head = tags_line_beg.filter(isSectionHead)
		console.log(tags_section_head);


		// tags_line_beg.forEach(element => {
		// 	if (view instanceof MarkdownView) {
		// 		let line = view.editor.getLine(element.position.start.line - 1)
		// 		console.log(line)
		// 		console.log( line === '');
		// 	}
		// })

		function isSectionHead(item: any){
			let line_num = item.position.start.line
			if (view instanceof MarkdownView) {
				if (line_num == 0) {
					return true
				} else if (view.editor.getLine(line_num - 1) === ''){
					return true
				} else {
					return false
				}
			}
		}

		let tag_data = []
		for (const [key, value] of Object.entries(tags_section_head)) {
			if (view instanceof MarkdownView && tags_special.includes(value.tag)) {
				let line = view.editor.getLine(value.position.start.line)
				let start_position = line.search(" ");
				let task_name = line.substring(start_position, start_position + max_char);
				tag_data.push([value.tag, task_name, start_position])
				// console.log(value.tag, ' -- ', task_name);
			}
		}

		console.log(tag_data)

	}
}
	





