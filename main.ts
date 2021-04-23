import { MarkdownView, Plugin, ItemView, WorkspaceLeaf, Menu, EditorPosition, FuzzySuggestModal} from 'obsidian';
import {App, Modal} from 'obsidian'
const plugin_name = 'koncham-treadmills'
const view_type = 'treadmills'
const view_name = 'treadmills'

export default class konchamTreadmills extends Plugin {
	public view: TreadmillsView
	EditorPosition: EditorPosition

	onunload() {
		this.app.workspace.detachLeavesOfType(view_type);
		console.log('unloading plugin: ' + plugin_name);
	}

	async onload() {
		console.log('loading plugin: ' + plugin_name);

		this.registerView(
			view_type,
			(leaf) => (this.view = new TreadmillsView(leaf, this))
		);

		this.registerEvent(this.app.workspace.on('active-leaf-change', this.handleChange));
		this.registerEvent(this.app.workspace.on('layout-ready', this.handleChange));
		this.registerEvent(this.app.workspace.on('layout-change', this.handleChange));
		this.registerEvent(this.app.metadataCache.on('changed', this.handleChange));

		if (this.app.workspace.layoutReady) {
			this.initView();
		} else {
			this.registerEvent(this.app.workspace.on('layout-ready', this.initView));
		}

		// mch_todo remove before release
		this.addCommand({ 
			id: 'placeholder1',
			name: 'placeholder1',
			hotkeys: [{ "modifiers": [], "key": "F22" }],
			callback: () => this.placeholder1(),
		});

		this.addCommand({
			id: 'log-treadmills-note',
			name: 'log treadmills in note',
			// mch_todo remove before release
			hotkeys: [{ "modifiers": [], "key": "F23" }],
			callback: () => this.logTreadmillsNote(),
		});

		this.addCommand({
			id: 'show-treadmills-view',
			name: 'show treadmills view',
			callback: () => this.showTreadmillsView(),
		});

		this.addCommand({
			id: 'switch-item',
			name: 'Open Item Switcher',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new itemSwitchModal(this.app, this.getTreadmillsNoteData()).open();
					}
					return true;
				}
				return false;
			}
		});
	
	}

	private readonly initView = (): void => {
		if (this.app.workspace.getLeavesOfType(view_type).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: view_type,
			active: true,
		});
	};

	// flashes the current line to highlight
	flashLine() {
		const view = this.app.workspace.activeLeaf.view;
		if (view instanceof MarkdownView) {
			const cm = view.sourceMode.cmEditor;
			let cursorLine = cm.getCursor().line;
			cm.addLineClass(cursorLine, "wrap", plugin_name + "-flash")
			setTimeout(() => {
				cm.removeLineClass(cursorLine, "wrap", plugin_name + "-flash")
			}, 100);
		}
	}

	showTreadmillsView() {
		this.app.workspace.iterateAllLeaves((leaf: any) => {
			if (leaf.getViewState()['type'] == view_type) {
				this.app.workspace.revealLeaf(leaf);
			}
		});
	}

	private readonly handleChange = async () => {
		this.view.initialize();
	}

	// mch_todo remove before release
	placeholder1() {
		console.log(plugin_name + ': placeholder1');
		let view = this.app.workspace.activeLeaf.view
		if (view instanceof MarkdownView){
			console.log(view.editor.getCursor())
			
		}
	}

	
	getTreadmillsNote() {
		// mch_todo take these from settings
		let max_char = 120
		let tags_treadmill = ['#curr', '#todo', '#idea', '#done']
		// final section
		let view = this.app.workspace.activeLeaf.view;
		let file = this.app.workspace.getActiveFile();
		let file_cache = this.app.metadataCache.getFileCache(file);
		let tags_data
		if ('tags' in file_cache) {
			tags_data = Object.values(file_cache.tags)
			tags_data = tags_data.filter(item => (tags_treadmill.includes(item.tag)))
			tags_data = tags_data.filter(item => (item.position.start.col == 0))
			tags_data = tags_data.filter(isSectionHead)
		}
		let tag_data = []
		let tmill_data = []
		if (tags_data) {
			for (const [key, value] of Object.entries(tags_data)) {
				if (view instanceof MarkdownView && tags_treadmill.includes(value.tag)) {
					let line_num = value.position.start.line
					let line = view.editor.getLine(line_num)
					let start_position = line.search(" ");
					let task_name = line.substring(start_position, start_position + max_char);
					tag_data.push([value.tag, task_name, line_num, start_position])
					tmill_data.push({
						rung: value.tag,
						title: task_name,
						line: line_num,
						start: start_position
					})
				}
			}
		}

		tag_data.sort(sortDefault)
		return (tag_data);

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

		function sortDefault(item1: any, item2: any){
			let treadmill_order = tags_treadmill.indexOf(item1[0]) - tags_treadmill.indexOf(item2[0])
			if(treadmill_order == 0){
				item1[1].localeCompare(item2[1])
			} else {
				return treadmill_order
			}
		}
	
	}

	getTreadmillsNoteData() {
		// mch_todo take these from settings
		let max_char = 120
		let tags_treadmill = ['#curr', '#todo', '#idea', '#done']
		// final section
		let view = this.app.workspace.activeLeaf.view;
		let file = this.app.workspace.getActiveFile();
		let file_cache = this.app.metadataCache.getFileCache(file);
		let tags_data
		if ('tags' in file_cache) {
			tags_data = Object.values(file_cache.tags)
			tags_data = tags_data.filter(item => (tags_treadmill.includes(item.tag)))
			tags_data = tags_data.filter(item => (item.position.start.col == 0))
			tags_data = tags_data.filter(isSectionHead)
		}
		let tmill_data = []
		if (tags_data) {
			for (const [key, value] of Object.entries(tags_data)) {
				if (view instanceof MarkdownView && tags_treadmill.includes(value.tag)) {
					let line_num = value.position.start.line
					let line = view.editor.getLine(line_num)
					let start_position = line.search(" ");
					let task_name = line.substring(start_position, start_position + max_char);
					tmill_data.push({
						rung: value.tag,
						title: task_name,
						line: line_num,
						start: start_position
					})
				}
			}
		}

		tmill_data.sort(sortDefault)
		return (tmill_data);

		function isSectionHead(item: any) {
			let line_num = item.position.start.line
			if (view instanceof MarkdownView) {
				if (line_num == 0) {
					return true
				} else if (view.editor.getLine(line_num - 1) === '') {
					return true
				} else {
					return false
				}
			}
		}

		function sortDefault(item1: any, item2: any) {
			let treadmill_order = tags_treadmill.indexOf(item1.rung) - tags_treadmill.indexOf(item2.rung)
			if (treadmill_order == 0) {
				item1.title.localeCompare(item2.title)
			} else {
				return treadmill_order
			}
		}

	}

	logTreadmillsNote(){
		console.log(this.getTreadmillsNote())
		console.log(this.getTreadmillsNoteData())
	}


	
}

// I've used large parts of the code from
// (recent-files plugin)[https://github.com/tgrosinger/recent-files-obsidian]
class TreadmillsView extends ItemView {
	private readonly plugin: konchamTreadmills
	EditorPosition: EditorPosition

	constructor(
		leaf: WorkspaceLeaf,
		plugin: konchamTreadmills,
	) {
		super(leaf);

		this.plugin = plugin;
		this.initialize();
	}

	public readonly initialize = (): void => {
		// let leaf_active = this.app.workspace.activeLeaf;
		const file = this.app.workspace.getActiveFile();
		if (file == null){
			this.createContentEmpty('not applicable')
		} else {
			const view = this.app.workspace.activeLeaf.view;
			let treadmills_data = this.plugin.getTreadmillsNote();
			// console.log(plugin_name + ': treadmills_data', treadmills_data)
			if (view instanceof MarkdownView && treadmills_data.length) {
				this.createContentData(treadmills_data)
			} else if (view instanceof MarkdownView) {
				this.createContentEmpty('no treadmills')
			} else {
				this.createContentEmpty('not applicable')
			}
		}
		
	}

	createContentData(treadmills_data: any){
		const rootEl = createDiv({ cls: 'nav-folder mod-root koncham-treadmills' });
		treadmills_data.forEach((item: any) => {
			const navFile = rootEl.createDiv({ cls: 'nav-file' });
			const navFileTitle = navFile.createDiv({ cls: 'nav-file-title' });

			let displaytext = item[0] + " -- " + item[1]

			navFileTitle.createDiv({
				cls: 'nav-file-title-content',
				text: displaytext,
			});
			navFileTitle.setAttr("data-line", item[2])
			navFileTitle.setAttr("data-char", item[3])
			const contentEl = this.containerEl.children[1];
			contentEl.empty();
			contentEl.appendChild(rootEl);

			navFileTitle.onClickEvent(() => {
				let line_num = parseInt(navFileTitle.getAttr('data-line'))
				let char_num = parseInt(navFileTitle.getAttr('data-char'))
				let view = this.app.workspace.activeLeaf.view
				if (view instanceof MarkdownView){
					let editor = view.editor
					// mch_todo expose the `120` to settings
					editor.setSelection({ line: line_num, ch: 0 }, { line: line_num, ch: char_num + 120 })
				}

			});
		});
	}

	createContentEmpty(message: string){
		const rootEl = createDiv({ 
			cls: 'pane-empty',
			text: "-- " + message + " --" 
		});
		const contentEl = this.containerEl.children[1];
		contentEl.empty();
		contentEl.appendChild(rootEl);
	}

	public getViewType(): string {
		return view_type;
	}

	public getDisplayText(): string {
		return view_name;
	}

	public getIcon(): string {
		return 'double-down-arrow-glyph';
	}

	public onHeaderMenu(menu: Menu): void {
		menu
			.addItem((item) => {
				item
					.setTitle('close')
					.setIcon('cross')
					.onClick(() => {
						this.app.workspace.detachLeavesOfType(view_type);
					});
			})
			
	}
}


interface treadmillItem {
	rung: string;
	title: string;
	line: number;
	start: number;
}

class itemSwitchModal extends FuzzySuggestModal<treadmillItem> {
	app: App;
	items: treadmillItem[];
	
	constructor(app: App, items: treadmillItem[]) {
		super(app);
		this.app = app;
		this.items = items;
	}

	getItems(): treadmillItem[] {
		return this.items;
	}

	getItemText(item: treadmillItem): string {
		return item.rung + " -- " + item.title;
	}

	onChooseItem(item: treadmillItem, evt: MouseEvent | KeyboardEvent): void {
		console.log(item.title)
		let view = this.app.workspace.activeLeaf.view
		if (view instanceof MarkdownView) {
			let editor = view.editor
			editor.setSelection({ line: item.line, ch: item.start + 1 })
		}
	}
}