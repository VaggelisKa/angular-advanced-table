import { InjectionToken, Optional, SkipSelf, assertInInjectionContext, computed, inject, isSignal } from "@angular/core";
const NAT_EN_LOCALE_ID = "en";
const NAT_DA_LOCALE_ID = "da";
const NAT_FI_LOCALE_ID = "fi";
const NAT_NB_LOCALE_ID = "nb";
const NAT_NO_LOCALE_ID = "no";
const NAT_SV_LOCALE_ID = "sv";
const rows$3 = (count) => count === 1 ? "række" : "rækker";
const items$2 = (count) => count === 1 ? "element" : "elementer";
const visibleColumns$2 = (count) => count === 1 ? "synlig kolonne" : "synlige kolonner";
const visibleFields$2 = (count) => count === 1 ? "synligt felt" : "synlige felter";
const filteredRows$3 = (count) => count === 1 ? "filtreret række" : "filtrerede rækker";
const selectedRows$3 = (count) => count === 1 ? "række er valgt" : "rækker er valgt";
const measuredRows$3 = (count) => count === 1 ? "række målt" : "rækker målt";
const measuredVisibleRows$3 = (count) => count === 1 ? "synlig række målt" : "synlige rækker målt";
const sortDirection$2 = (sortState) => sortState === "ascending" ? "stigende" : "faldende";
const side$3 = (target) => target === "left" ? "til venstre" : "til højre";
const pinSideText$3 = (pinSide, toggleAction) => `${toggleAction === "unpin" ? "fra" : "til"} ${pinSide === "left" ? "venstre" : "højre"}`;
const visibilityVerb$3 = (visibilityState) => visibilityState === "visible" ? "vises" : "skjules";
const columnZone$3 = (zone) => {
	if (zone === "left") return "fastgjort til venstre";
	if (zone === "right") return "fastgjort til højre";
	return "ikke fastgjort";
};
const resizeBoundSuffix$4 = (atMinimum, atMaximum) => {
	if (atMinimum) return " (minimum)";
	if (atMaximum) return " (maksimum)";
	return "";
};
const renderToneLabel$3 = (tone) => {
	switch (tone) {
		case "fast": return "Hurtig";
		case "watch": return "Hold øje";
		case "slow": return "Langsom";
		case "idle": return "Inaktiv";
	}
};
const DEFAULT_NUMBER_FORMATTER = (value, options, locale) => new Intl.NumberFormat(locale, options).format(value);
const NAT_DA_CONTROLS_LOCALE_LABELS = {
	search: {
		label: "Søg i rækker",
		placeholder: "Søg i rækker"
	},
	columnVisibility: {
		label: "Kolonner",
		groupAriaLabel: "Kolonnesynlighed",
		accessibilityLabels: {
			visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
			toggleColumnAriaLabel: ({ columnLabel, visibilityState }) => `${columnLabel}, ${visibilityState === "visible" ? "vist" : "skjult"}`,
			columnState: ({ visibilityState }) => visibilityState === "visible" ? "Vist" : "Skjult"
		}
	},
	pageSize: {
		groupAriaLabel: "Rækker pr. side",
		accessibilityLabels: {
			pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$3(pageSizeValue)}`,
			pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$3(pageSizeValue)}`
		}
	},
	pager: {
		groupAriaLabel: "Sidenavigation i tabel",
		accessibilityLabels: {
			previousPageAriaLabel: "Forrige side",
			nextPageAriaLabel: "Næste side",
			pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`
		}
	},
	scrollControl: {
		groupAriaLabel: "Vandret rulning",
		accessibilityLabels: {
			scrollLeftAriaLabel: "Rul til venstre",
			scrollRightAriaLabel: "Rul til højre",
			scrollPositionAriaLabel: "Rulleposition",
			scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
		}
	},
	headerActions: { accessibilityLabels: {
		sortButton: ({ label, sortState, sortPriority, sortCount }) => {
			if (sortState === "none") return `Sortér efter ${label}`;
			const sortDescription = `Sortér efter ${label}, sorteret ${sortDirection$2(sortState)}`;
			return sortPriority !== null && sortCount > 1 ? `${sortDescription}, sortering ${sortPriority} af ${sortCount}` : sortDescription;
		},
		menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
		menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
		pinButton: ({ toggleAction, pinSide }) => {
			return `${toggleAction === "unpin" ? "Frigør" : "Fastgør"} ${pinSideText$3(pinSide, toggleAction)}`;
		},
		pinButtonText: ({ pinSide, toggleAction }) => {
			return `${toggleAction === "unpin" ? "Frigør" : "Fastgør"} ${pinSideText$3(pinSide, toggleAction)}`;
		},
		moveButton: ({ direction }) => `Flyt ${side$3(direction)}`,
		moveButtonText: ({ direction }) => `Flyt ${side$3(direction)}`
	} },
	toolbar: { toolbarLabel: "Værktøjslinje til tabel" },
	selection: {
		columnLabel: "Markering",
		accessibilityLabels: {
			selectAllAriaLabel: "Vælg alle rækker",
			selectRowAriaLabel: ({ rowId }) => `Vælg række ${rowId}`
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_DA_RENDER_METRICS_LOCALE_LABELS = {
	renderMetrics: {
		filter: {
			heading: "Gengivelseshastighed",
			groupAriaLabel: "Rækkers gengivelseshastighed",
			idleCaption: "Viser den seneste optegningstid for rækker på den aktuelle side.",
			rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$3(rowCountValue)}`,
			options: [
				{
					value: "all",
					label: "Alle rækker",
					description: "Vis alle målte rækker"
				},
				{
					value: "fast",
					label: "Hurtig",
					description: "Rækker, der blev gengivet hurtigt"
				},
				{
					value: "watch",
					label: "Hold øje",
					description: "Rækker, der er værd at holde øje med"
				},
				{
					value: "slow",
					label: "Langsom",
					description: "Rækker, der blev gengivet langsomt"
				}
			]
		},
		panel: {
			ariaLabel: "Måling af rækkegengivelse",
			toneLabel: renderToneLabel$3,
			idleSummary: "inaktiv",
			rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$3(rowCountValue)}`,
			duration: ({ durationMsText }) => `${durationMsText} ms`
		},
		column: {
			header: "Gengivelse",
			pendingLabel: "Afventer",
			unitSuffix: " ms"
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const listKeyboardInstructions$4 = "Brug Pil op og Pil ned til at flytte mellem elementer. Tryk på Enter for at bruge kontrollerne i et element, Tab og Skift+Tab for at flytte mellem dem og Esc for at vende tilbage til elementet.";
const listSummary$4 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
	const fields = `${visibleColumnsText} ${visibleFields$2(visibleColumnsValue)}`;
	let summary;
	if (visibleRowsValue === 0) summary = `Ingen elementer vises. ${fields}.`;
	else if (totalRowsValue !== visibleRowsValue) summary = `Viser ${visibleRowsText} af ${totalRowsText} ${items$2(totalRowsValue)}, ${fields}.`;
	else summary = `Viser ${visibleRowsText} ${items$2(visibleRowsValue)}, ${fields}.`;
	if (paginationState === "enabled") summary += ` Side ${pageText} af ${pageCountText}.`;
	return summary;
};
const listColumnVisibilityChange$4 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
	const summary = `${visibleColumnsText} ${visibleFields$2(visibleColumnsValue)}.`;
	if (changedColumns.length === 1) {
		const [column] = changedColumns;
		return `Feltet ${column.label} ${visibilityVerb$3(column.visibilityState)}. ${summary}`;
	}
	return summary;
};
const listPageSizeChange$4 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${items$2(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`;
const listPageChange$4 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${items$2(visibleRowsValue)} vises.`;
const listSubHeaderRow$4 = ({ valueText, rowCountValue, rowCountText }) => {
	return `${valueText.trim() ? `Gruppen ${valueText}` : "Gruppe"}, ${rowCountText} ${items$2(rowCountValue)}.`;
};
const NAT_DA_LOCALE_LABELS = {
	accessibilityText: {
		listKeyboardInstructions: listKeyboardInstructions$4,
		listSummary: listSummary$4,
		listColumnVisibilityChange: listColumnVisibilityChange$4,
		listPageSizeChange: listPageSizeChange$4,
		listPageChange: listPageChange$4,
		listSubHeaderRow: listSubHeaderRow$4,
		keyboardInstructions: "Brug piletasterne til at flytte mellem celler. Hvis en celle kun indeholder én kontrol, der ikke bruger piletaster, får kontrollen fokus direkte. Ellers bruges Enter til at betjene kontrollerne, Tab og Skift+Tab til at flytte mellem dem og Esc til at vende tilbage til cellen.",
		emptyState: "Ingen rækker matcher den aktuelle visning.",
		loadingState: "Indlæser rækker.",
		errorState: "Rækkerne kunne ikke indlæses.",
		reorderKeyboardInstructions: "Tryk på Ctrl+Skift sammen med Venstre eller Højre pil for at flytte en kolonne inden for dens fastgjorte område. Brug Kommando på macOS.",
		resizeKeyboardInstructions: "Tryk på Alt sammen med Venstre eller Højre pil for at ændre kolonnens bredde, eller Alt sammen med Home eller End for mindste eller største bredde.",
		tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
			const columns = `${visibleColumnsText} ${visibleColumns$2(visibleColumnsValue)}`;
			let summary;
			if (visibleRowsValue === 0) summary = `Ingen rækker vises. ${columns}.`;
			else if (totalRowsValue !== visibleRowsValue) summary = `Viser ${visibleRowsText} af ${totalRowsText} ${rows$3(totalRowsValue)}, ${columns}.`;
			else summary = `Viser ${visibleRowsText} ${rows$3(visibleRowsValue)}, ${columns}.`;
			if (paginationState === "enabled") summary += ` Side ${pageText} af ${pageCountText}.`;
			return summary;
		},
		sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
			if (!columnLabel || sortState === "none") return "Sorteringen er ryddet.";
			if (sortedColumns.length > 1) {
				const parts = sortedColumns.map((column) => `${column.label} ${sortDirection$2(column.sortState)}`);
				return `Sorteret efter ${parts.slice(0, -1).join(", ")} og derefter ${parts.at(-1)}.`;
			}
			return `Sorteret efter ${columnLabel} ${sortDirection$2(sortState)}.`;
		},
		filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
			if (visibleRowsValue === 0) return query ? `Ingen rækker matcher "${query}".` : "Ingen rækker matcher de aktuelle filtre.";
			if (query) return `${visibleRowsText} ${rows$3(visibleRowsValue)} matcher "${query}".`;
			if (filterState === "column") return `${visibleRowsText} ${filteredRows$3(visibleRowsValue)}.`;
			return `Alle rækker: ${visibleRowsText}.`;
		},
		columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
			const summary = `${visibleColumnsText} ${visibleColumns$2(visibleColumnsValue)}.`;
			if (changedColumns.length === 1) {
				const [column] = changedColumns;
				return `Kolonnen ${column.label} ${visibilityVerb$3(column.visibilityState)}. ${summary}`;
			}
			return summary;
		},
		pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${rows$3(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
		pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${rows$3(visibleRowsValue)} vises.`,
		columnReorder: ({ label, positionText, totalText, zone }) => `Kolonnen ${label} flyttet til position ${positionText} af ${totalText}, ${columnZone$3(zone)}.`,
		columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolonnen ${label} har bredden ${widthText} pixel${resizeBoundSuffix$4(atMinimum, atMaximum)}.`,
		selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
			if (selectedCountValue === 0) return "Markeringen er ryddet.";
			if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) return `Alle ${totalRowsText} ${selectedRows$3(totalRowsValue)}.`;
			return `${selectedCountText} ${selectedRows$3(selectedCountValue)}.`;
		},
		subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
			return `${valueText.trim() ? `Gruppen ${valueText}` : "Gruppe"}, ${rowCountText} ${rows$3(rowCountValue)}.`;
		},
		placeholderRow: () => "Indlæser.",
		shortcutLabel: ({ label, shortcutText }) => `${label} (Genvej: ${shortcutText})`
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const rows$2 = (count) => count === 1 ? "rivi" : "riviä";
const items$1 = (count) => count === 1 ? "kohde" : "kohdetta";
const columns = (count) => count === 1 ? "sarake" : "saraketta";
const fields = (count) => count === 1 ? "kenttä" : "kenttää";
const filteredRows$2 = (count) => count === 1 ? "suodatettu rivi" : "suodatettua riviä";
const matchingRows = (count) => count === 1 ? "vastaava rivi" : "vastaavaa riviä";
const selectedRows$2 = (count) => count === 1 ? "rivi valittu" : "riviä valittu";
const measuredRows$2 = (count) => count === 1 ? "rivi mitattu" : "riviä mitattu";
const measuredVisibleRows$2 = (count) => count === 1 ? "näkyvä rivi mitattu" : "näkyvää riviä mitattu";
const sortAdverb = (sortState) => sortState === "ascending" ? "nousevasti" : "laskevasti";
const side$2 = (target) => target === "left" ? "vasemmalle" : "oikealle";
const pinSideText$2 = (pinSide, toggleAction) => {
	if (toggleAction === "unpin") return pinSide === "left" ? "vasemmalta" : "oikealta";
	return side$2(pinSide);
};
const visibilityVerb$2 = (visibilityState) => visibilityState === "visible" ? "näytetään" : "piilotetaan";
const columnZone$2 = (zone) => {
	if (zone === "left") return "kiinnitetty vasemmalle";
	if (zone === "right") return "kiinnitetty oikealle";
	return "ei kiinnitetty";
};
const resizeBoundSuffix$3 = (atMinimum, atMaximum) => {
	if (atMinimum) return " (vähimmäisleveys)";
	if (atMaximum) return " (enimmäisleveys)";
	return "";
};
const renderToneLabel$2 = (tone) => {
	switch (tone) {
		case "fast": return "Nopea";
		case "watch": return "Tarkkaile";
		case "slow": return "Hidas";
		case "idle": return "Ei mittausta";
	}
};
const NAT_FI_CONTROLS_LOCALE_LABELS = {
	search: {
		label: "Hae riveistä",
		placeholder: "Hae riveistä"
	},
	columnVisibility: {
		label: "Sarakkeet",
		groupAriaLabel: "Sarakkeiden näkyvyys",
		accessibilityLabels: {
			visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} näkyvissä`,
			toggleColumnAriaLabel: ({ columnLabel, visibilityState }) => `${columnLabel}, ${visibilityState === "visible" ? "näkyvissä" : "piilotettu"}`,
			columnState: ({ visibilityState }) => visibilityState === "visible" ? "Näkyvissä" : "Piilotettu"
		}
	},
	pageSize: {
		groupAriaLabel: "Rivejä sivulla",
		accessibilityLabels: {
			pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$2(pageSizeValue)}`,
			pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$2(pageSizeValue)}`
		}
	},
	pager: {
		groupAriaLabel: "Taulukon sivutus",
		accessibilityLabels: {
			previousPageAriaLabel: "Edellinen sivu",
			nextPageAriaLabel: "Seuraava sivu",
			pageIndicator: ({ pageText, pageCountText }) => `Sivu ${pageText} / ${pageCountText}`
		}
	},
	scrollControl: {
		groupAriaLabel: "Vaakavieritys",
		accessibilityLabels: {
			scrollLeftAriaLabel: "Vieritä vasemmalle",
			scrollRightAriaLabel: "Vieritä oikealle",
			scrollPositionAriaLabel: "Vierityksen sijainti",
			scrollPositionText: ({ percentageText }) => `Vieritetty ${percentageText} %`
		}
	},
	headerActions: { accessibilityLabels: {
		sortButton: ({ label, sortState, sortPriority, sortCount }) => {
			if (sortState === "none") return `Lajittele sarakkeen ${label} mukaan`;
			const sortDescription = `Lajittele sarakkeen ${label} mukaan, lajiteltu ${sortAdverb(sortState)}`;
			return sortPriority !== null && sortCount > 1 ? `${sortDescription}, lajittelu ${sortPriority} / ${sortCount}` : sortDescription;
		},
		menuButton: ({ label }) => `Sarakkeen ${label} toiminnot`,
		menuLabel: ({ label }) => `Sarakkeen ${label} toiminnot`,
		pinButton: ({ toggleAction, pinSide }) => {
			return `${toggleAction === "unpin" ? "Irrota" : "Kiinnitä"} ${pinSideText$2(pinSide, toggleAction)}`;
		},
		pinButtonText: ({ pinSide, toggleAction }) => {
			return `${toggleAction === "unpin" ? "Irrota" : "Kiinnitä"} ${pinSideText$2(pinSide, toggleAction)}`;
		},
		moveButton: ({ direction }) => `Siirrä ${side$2(direction)}`,
		moveButtonText: ({ direction }) => `Siirrä ${side$2(direction)}`
	} },
	toolbar: { toolbarLabel: "Taulukon työkalurivi" },
	selection: {
		columnLabel: "Valinta",
		accessibilityLabels: {
			selectAllAriaLabel: "Valitse kaikki rivit",
			selectRowAriaLabel: ({ rowId }) => `Valitse rivi ${rowId}`
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_FI_RENDER_METRICS_LOCALE_LABELS = {
	renderMetrics: {
		filter: {
			heading: "Renderöintinopeus",
			groupAriaLabel: "Rivien renderöintinopeus",
			idleCaption: "Näyttää nykyisen sivun rivien viimeisimmän piirtoajan.",
			rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$2(rowCountValue)}`,
			options: [
				{
					value: "all",
					label: "Kaikki rivit",
					description: "Näytä kaikki mitatut rivit"
				},
				{
					value: "fast",
					label: "Nopea",
					description: "Nopeasti renderöityneet rivit"
				},
				{
					value: "watch",
					label: "Tarkkaile",
					description: "Rivit, joita kannattaa tarkkailla"
				},
				{
					value: "slow",
					label: "Hidas",
					description: "Hitaasti renderöityneet rivit"
				}
			]
		},
		panel: {
			ariaLabel: "Rivien renderöintimittaus",
			toneLabel: renderToneLabel$2,
			idleSummary: "ei mittausta",
			rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$2(rowCountValue)}`,
			duration: ({ durationMsText }) => `${durationMsText} ms`
		},
		column: {
			header: "Renderöinti",
			pendingLabel: "Odottaa",
			unitSuffix: " ms"
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const listKeyboardInstructions$3 = "Siirry kohteiden välillä Nuoli ylös - ja Nuoli alas -näppäimillä. Käytä kohteen ohjaimia painamalla Enter, siirry niiden välillä sarkaimella ja näppäinyhdistelmällä Vaihto+Sarkain ja palaa kohteeseen painamalla Esc.";
const listSummary$3 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
	const visible = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}`;
	let summary;
	if (visibleRowsValue === 0) summary = `Ei kohteita näkyvissä. ${visible}.`;
	else if (totalRowsValue !== visibleRowsValue) summary = `Näytetään ${visibleRowsText} / ${totalRowsText} ${items$1(totalRowsValue)}. ${visible}.`;
	else summary = `Näytetään ${visibleRowsText} ${items$1(visibleRowsValue)}. ${visible}.`;
	if (paginationState === "enabled") summary += ` Sivu ${pageText} / ${pageCountText}.`;
	return summary;
};
const listColumnVisibilityChange$3 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
	const summary = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}.`;
	if (changedColumns.length === 1) {
		const [column] = changedColumns;
		return `Kenttä ${column.label} ${visibilityVerb$2(column.visibilityState)}. ${summary}`;
	}
	return summary;
};
const listPageSizeChange$3 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${items$1(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`;
const listPageChange$3 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${items$1(visibleRowsValue)}.`;
const listSubHeaderRow$3 = ({ valueText, rowCountValue, rowCountText }) => {
	return `${valueText.trim() ? `Ryhmä ${valueText}` : "Ryhmä"}, ${rowCountText} ${items$1(rowCountValue)}.`;
};
const NAT_FI_LOCALE_LABELS = {
	accessibilityText: {
		listKeyboardInstructions: listKeyboardInstructions$3,
		listSummary: listSummary$3,
		listColumnVisibilityChange: listColumnVisibilityChange$3,
		listPageSizeChange: listPageSizeChange$3,
		listPageChange: listPageChange$3,
		listSubHeaderRow: listSubHeaderRow$3,
		keyboardInstructions: "Siirry solujen välillä nuolinäppäimillä. Jos solun ainoa sisältö on ohjain, joka ei käytä nuolinäppäimiä, kohdistus siirtyy suoraan siihen. Muissa soluissa käytä ohjaimia painamalla Enter, siirry niiden välillä sarkaimella ja näppäinyhdistelmällä Vaihto+Sarkain ja palaa soluun painamalla Esc.",
		emptyState: "Mikään rivi ei vastaa nykyistä näkymää.",
		loadingState: "Ladataan rivejä.",
		errorState: "Rivien lataaminen epäonnistui.",
		reorderKeyboardInstructions: "Siirrä saraketta kiinnitysalueensa sisällä painamalla Ctrl+Vaihto ja Nuoli vasemmalle - tai Nuoli oikealle -näppäintä. Käytä macOS:ssä Komento-näppäintä Ctrl-näppäimen sijaan.",
		resizeKeyboardInstructions: "Muuta sarakkeen leveyttä painamalla Alt-näppäintä ja Nuoli vasemmalle - tai Nuoli oikealle -näppäintä. Valitse pienin tai suurin leveys painamalla Alt+Home tai Alt+End.",
		tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
			const visible = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}`;
			let summary;
			if (visibleRowsValue === 0) summary = `Ei rivejä näkyvissä. ${visible}.`;
			else if (totalRowsValue !== visibleRowsValue) summary = `Näytetään ${visibleRowsText} / ${totalRowsText} ${rows$2(totalRowsValue)}. ${visible}.`;
			else summary = `Näytetään ${visibleRowsText} ${rows$2(visibleRowsValue)}. ${visible}.`;
			if (paginationState === "enabled") summary += ` Sivu ${pageText} / ${pageCountText}.`;
			return summary;
		},
		sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
			if (!columnLabel || sortState === "none") return "Lajittelu poistettu.";
			if (sortedColumns.length > 1) {
				const parts = sortedColumns.map((column) => `${column.label} ${sortAdverb(column.sortState)}`);
				return `Lajiteltu: ${parts.slice(0, -1).join(", ")} ja sitten ${parts.at(-1)}.`;
			}
			return `Lajiteltu sarakkeen ${columnLabel} mukaan ${sortAdverb(sortState)}.`;
		},
		filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
			if (visibleRowsValue === 0) return query ? `Mikään rivi ei vastaa hakua "${query}".` : "Mikään rivi ei vastaa nykyisiä suodattimia.";
			if (query) return `${visibleRowsText} hakua "${query}" ${matchingRows(visibleRowsValue)}.`;
			if (filterState === "column") return `${visibleRowsText} ${filteredRows$2(visibleRowsValue)}.`;
			return `Kaikki rivit: ${visibleRowsText}.`;
		},
		columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
			const summary = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}.`;
			if (changedColumns.length === 1) {
				const [column] = changedColumns;
				return `Sarake ${column.label} ${visibilityVerb$2(column.visibilityState)}. ${summary}`;
			}
			return summary;
		},
		pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${rows$2(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
		pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${rows$2(visibleRowsValue)}.`,
		columnReorder: ({ label, positionText, totalText, zone }) => `Sarake ${label} siirretty paikkaan ${positionText} / ${totalText}, ${columnZone$2(zone)}.`,
		columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Sarakkeen ${label} leveys on ${widthText} pikseliä${resizeBoundSuffix$3(atMinimum, atMaximum)}.`,
		selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
			if (selectedCountValue === 0) return "Valinta tyhjennetty.";
			if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) return `Kaikki ${totalRowsText} ${selectedRows$2(totalRowsValue)}.`;
			return `${selectedCountText} ${selectedRows$2(selectedCountValue)}.`;
		},
		subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
			return `${valueText.trim() ? `Ryhmä ${valueText}` : "Ryhmä"}, ${rowCountText} ${rows$2(rowCountValue)}.`;
		},
		placeholderRow: () => "Ladataan.",
		shortcutLabel: ({ label, shortcutText }) => `${label} (Pikanäppäin: ${shortcutText})`
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const rows$1 = (count) => count === 1 ? "rad" : "rader";
const items = (count) => count === 1 ? "element" : "elementer";
const visibleColumns$1 = (count) => count === 1 ? "synlig kolonne" : "synlige kolonner";
const visibleFields$1 = (count) => count === 1 ? "synlig felt" : "synlige felter";
const filteredRows$1 = (count) => count === 1 ? "filtrert rad" : "filtrerte rader";
const selectedRows$1 = (count) => count === 1 ? "rad er valgt" : "rader er valgt";
const measuredRows$1 = (count) => count === 1 ? "rad målt" : "rader målt";
const measuredVisibleRows$1 = (count) => count === 1 ? "synlig rad målt" : "synlige rader målt";
const sortDirection$1 = (sortState) => sortState === "ascending" ? "stigende" : "synkende";
const side$1 = (target) => target === "left" ? "til venstre" : "til høyre";
const pinSideText$1 = (pinSide, toggleAction) => `${toggleAction === "unpin" ? "fra" : "til"} ${pinSide === "left" ? "venstre" : "høyre"}`;
const visibilityVerb$1 = (visibilityState) => visibilityState === "visible" ? "vises" : "skjules";
const columnZone$1 = (zone) => {
	if (zone === "left") return "festet til venstre";
	if (zone === "right") return "festet til høyre";
	return "ikke festet";
};
const resizeBoundSuffix$2 = (atMinimum, atMaximum) => {
	if (atMinimum) return " (minimum)";
	if (atMaximum) return " (maksimum)";
	return "";
};
const renderToneLabel$1 = (tone) => {
	switch (tone) {
		case "fast": return "Rask";
		case "watch": return "Følg med";
		case "slow": return "Treg";
		case "idle": return "Inaktiv";
	}
};
const NAT_NB_CONTROLS_LOCALE_LABELS = {
	search: {
		label: "Søk i rader",
		placeholder: "Søk i rader"
	},
	columnVisibility: {
		label: "Kolonner",
		groupAriaLabel: "Kolonnesynlighet",
		accessibilityLabels: {
			visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
			toggleColumnAriaLabel: ({ columnLabel, visibilityState }) => `${columnLabel}, ${visibilityState === "visible" ? "vist" : "skjult"}`,
			columnState: ({ visibilityState }) => visibilityState === "visible" ? "Vist" : "Skjult"
		}
	},
	pageSize: {
		groupAriaLabel: "Rader per side",
		accessibilityLabels: {
			pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$1(pageSizeValue)}`,
			pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$1(pageSizeValue)}`
		}
	},
	pager: {
		groupAriaLabel: "Sidenavigasjon i tabell",
		accessibilityLabels: {
			previousPageAriaLabel: "Forrige side",
			nextPageAriaLabel: "Neste side",
			pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} av ${pageCountText}`
		}
	},
	scrollControl: {
		groupAriaLabel: "Vannrett rulling",
		accessibilityLabels: {
			scrollLeftAriaLabel: "Rull til venstre",
			scrollRightAriaLabel: "Rull til høyre",
			scrollPositionAriaLabel: "Rulleposisjon",
			scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
		}
	},
	headerActions: { accessibilityLabels: {
		sortButton: ({ label, sortState, sortPriority, sortCount }) => {
			if (sortState === "none") return `Sorter etter ${label}`;
			const sortDescription = `Sorter etter ${label}, sortert ${sortDirection$1(sortState)}`;
			return sortPriority !== null && sortCount > 1 ? `${sortDescription}, sortering ${sortPriority} av ${sortCount}` : sortDescription;
		},
		menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
		menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
		pinButton: ({ toggleAction, pinSide }) => {
			return `${toggleAction === "unpin" ? "Løsne" : "Fest"} ${pinSideText$1(pinSide, toggleAction)}`;
		},
		pinButtonText: ({ pinSide, toggleAction }) => {
			return `${toggleAction === "unpin" ? "Løsne" : "Fest"} ${pinSideText$1(pinSide, toggleAction)}`;
		},
		moveButton: ({ direction }) => `Flytt ${side$1(direction)}`,
		moveButtonText: ({ direction }) => `Flytt ${side$1(direction)}`
	} },
	toolbar: { toolbarLabel: "Verktøylinje for tabell" },
	selection: {
		columnLabel: "Merking",
		accessibilityLabels: {
			selectAllAriaLabel: "Velg alle rader",
			selectRowAriaLabel: ({ rowId }) => `Velg rad ${rowId}`
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_NB_RENDER_METRICS_LOCALE_LABELS = {
	renderMetrics: {
		filter: {
			heading: "Gjengivelseshastighet",
			groupAriaLabel: "Radenes gjengivelseshastighet",
			idleCaption: "Viser den siste opptegningstiden for rader på gjeldende side.",
			rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$1(rowCountValue)}`,
			options: [
				{
					value: "all",
					label: "Alle rader",
					description: "Vis alle målte rader"
				},
				{
					value: "fast",
					label: "Rask",
					description: "Rader som ble gjengitt raskt"
				},
				{
					value: "watch",
					label: "Følg med",
					description: "Rader som er verdt å følge med på"
				},
				{
					value: "slow",
					label: "Treg",
					description: "Rader som ble gjengitt tregt"
				}
			]
		},
		panel: {
			ariaLabel: "Måling av radgjengivelse",
			toneLabel: renderToneLabel$1,
			idleSummary: "inaktiv",
			rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$1(rowCountValue)}`,
			duration: ({ durationMsText }) => `${durationMsText} ms`
		},
		column: {
			header: "Gjengivelse",
			pendingLabel: "Venter",
			unitSuffix: " ms"
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const listKeyboardInstructions$2 = "Bruk Pil opp og Pil ned for å flytte mellom elementer. Trykk Enter for å bruke kontrollene i et element, Tab og Skift+Tab for å flytte mellom dem og Esc for å gå tilbake til elementet.";
const listSummary$2 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
	const fields = `${visibleColumnsText} ${visibleFields$1(visibleColumnsValue)}`;
	let summary;
	if (visibleRowsValue === 0) summary = `Ingen elementer vises. ${fields}.`;
	else if (totalRowsValue !== visibleRowsValue) summary = `Viser ${visibleRowsText} av ${totalRowsText} ${items(totalRowsValue)}, ${fields}.`;
	else summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)}, ${fields}.`;
	if (paginationState === "enabled") summary += ` Side ${pageText} av ${pageCountText}.`;
	return summary;
};
const listColumnVisibilityChange$2 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
	const summary = `${visibleColumnsText} ${visibleFields$1(visibleColumnsValue)}.`;
	if (changedColumns.length === 1) {
		const [column] = changedColumns;
		return `Feltet ${column.label} ${visibilityVerb$1(column.visibilityState)}. ${summary}`;
	}
	return summary;
};
const listPageSizeChange$2 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${items(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`;
const listPageChange$2 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`;
const listSubHeaderRow$2 = ({ valueText, rowCountValue, rowCountText }) => {
	return `${valueText.trim() ? `Gruppen ${valueText}` : "Gruppe"}, ${rowCountText} ${items(rowCountValue)}.`;
};
const NAT_NB_LOCALE_LABELS = {
	accessibilityText: {
		listKeyboardInstructions: listKeyboardInstructions$2,
		listSummary: listSummary$2,
		listColumnVisibilityChange: listColumnVisibilityChange$2,
		listPageSizeChange: listPageSizeChange$2,
		listPageChange: listPageChange$2,
		listSubHeaderRow: listSubHeaderRow$2,
		keyboardInstructions: "Bruk piltastene for å flytte mellom celler. Hvis en celle bare inneholder én kontroll som ikke bruker piltaster, får kontrollen fokus direkte. Ellers bruker du Enter for å betjene kontrollene, Tab og Skift+Tab for å flytte mellom dem og Esc for å gå tilbake til cellen.",
		emptyState: "Ingen rader samsvarer med gjeldende visning.",
		loadingState: "Laster rader.",
		errorState: "Radene kunne ikke lastes.",
		reorderKeyboardInstructions: "Trykk Ctrl+Skift sammen med Venstrepil eller Høyrepil for å flytte en kolonne innenfor området den er festet i. Bruk Kommando på macOS.",
		resizeKeyboardInstructions: "Trykk Alt sammen med Venstrepil eller Høyrepil for å endre kolonnens bredde, eller Alt sammen med Home eller End for minste eller største bredde.",
		tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
			const columns = `${visibleColumnsText} ${visibleColumns$1(visibleColumnsValue)}`;
			let summary;
			if (visibleRowsValue === 0) summary = `Ingen rader vises. ${columns}.`;
			else if (totalRowsValue !== visibleRowsValue) summary = `Viser ${visibleRowsText} av ${totalRowsText} ${rows$1(totalRowsValue)}, ${columns}.`;
			else summary = `Viser ${visibleRowsText} ${rows$1(visibleRowsValue)}, ${columns}.`;
			if (paginationState === "enabled") summary += ` Side ${pageText} av ${pageCountText}.`;
			return summary;
		},
		sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
			if (!columnLabel || sortState === "none") return "Sorteringen er fjernet.";
			if (sortedColumns.length > 1) {
				const parts = sortedColumns.map((column) => `${column.label} ${sortDirection$1(column.sortState)}`);
				return `Sortert etter ${parts.slice(0, -1).join(", ")} og deretter ${parts.at(-1)}.`;
			}
			return `Sortert etter ${columnLabel} ${sortDirection$1(sortState)}.`;
		},
		filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
			if (visibleRowsValue === 0) return query ? `Ingen rader samsvarer med "${query}".` : "Ingen rader samsvarer med gjeldende filtre.";
			if (query) return `${visibleRowsText} ${rows$1(visibleRowsValue)} samsvarer med "${query}".`;
			if (filterState === "column") return `${visibleRowsText} ${filteredRows$1(visibleRowsValue)}.`;
			return `Alle rader: ${visibleRowsText}.`;
		},
		columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
			const summary = `${visibleColumnsText} ${visibleColumns$1(visibleColumnsValue)}.`;
			if (changedColumns.length === 1) {
				const [column] = changedColumns;
				return `Kolonnen ${column.label} ${visibilityVerb$1(column.visibilityState)}. ${summary}`;
			}
			return summary;
		},
		pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${rows$1(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
		pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows$1(visibleRowsValue)} vises.`,
		columnReorder: ({ label, positionText, totalText, zone }) => `Kolonnen ${label} flyttet til posisjon ${positionText} av ${totalText}, ${columnZone$1(zone)}.`,
		columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolonnen ${label} har bredden ${widthText} piksler${resizeBoundSuffix$2(atMinimum, atMaximum)}.`,
		selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
			if (selectedCountValue === 0) return "Merkingen er fjernet.";
			if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) return `Alle ${totalRowsText} ${selectedRows$1(totalRowsValue)}.`;
			return `${selectedCountText} ${selectedRows$1(selectedCountValue)}.`;
		},
		subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
			return `${valueText.trim() ? `Gruppen ${valueText}` : "Gruppe"}, ${rowCountText} ${rows$1(rowCountValue)}.`;
		},
		placeholderRow: () => "Laster.",
		shortcutLabel: ({ label, shortcutText }) => `${label} (Hurtigtast: ${shortcutText})`
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const rows = (count) => count === 1 ? "rad" : "rader";
const visibleColumns = (count) => count === 1 ? "synlig kolumn" : "synliga kolumner";
const visibleFields = (count) => count === 1 ? "synligt fält" : "synliga fält";
const filteredRows = (count) => count === 1 ? "filtrerad rad" : "filtrerade rader";
const selectedRows = (count) => count === 1 ? "rad är markerad" : "rader är markerade";
const measuredRows = (count) => count === 1 ? "rad mätt" : "rader mätta";
const measuredVisibleRows = (count) => count === 1 ? "synlig rad mätt" : "synliga rader mätta";
const sortDirection = (sortState) => sortState === "ascending" ? "stigande" : "fallande";
const side = (target) => target === "left" ? "till vänster" : "till höger";
const pinSideText = (pinSide, toggleAction) => `${toggleAction === "unpin" ? "från" : "till"} ${pinSide === "left" ? "vänster" : "höger"}`;
const visibilityVerb = (visibilityState) => visibilityState === "visible" ? "visas" : "döljs";
const columnZone = (zone) => {
	if (zone === "left") return "fäst till vänster";
	if (zone === "right") return "fäst till höger";
	return "inte fäst";
};
const resizeBoundSuffix$1 = (atMinimum, atMaximum) => {
	if (atMinimum) return " (minimum)";
	if (atMaximum) return " (maximum)";
	return "";
};
const renderToneLabel = (tone) => {
	switch (tone) {
		case "fast": return "Snabb";
		case "watch": return "Bevaka";
		case "slow": return "Långsam";
		case "idle": return "Inaktiv";
	}
};
const NAT_SV_CONTROLS_LOCALE_LABELS = {
	search: {
		label: "Sök rader",
		placeholder: "Sök rader"
	},
	columnVisibility: {
		label: "Kolumner",
		groupAriaLabel: "Kolumnsynlighet",
		accessibilityLabels: {
			visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synliga`,
			toggleColumnAriaLabel: ({ columnLabel, visibilityState }) => `${columnLabel}, ${visibilityState === "visible" ? "synlig" : "dold"}`,
			columnState: ({ visibilityState }) => visibilityState === "visible" ? "Synlig" : "Dold"
		}
	},
	pageSize: {
		groupAriaLabel: "Rader per sida",
		accessibilityLabels: {
			pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
			pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`
		}
	},
	pager: {
		groupAriaLabel: "Sidnavigering i tabell",
		accessibilityLabels: {
			previousPageAriaLabel: "Föregående sida",
			nextPageAriaLabel: "Nästa sida",
			pageIndicator: ({ pageText, pageCountText }) => `Sida ${pageText} av ${pageCountText}`
		}
	},
	scrollControl: {
		groupAriaLabel: "Vågrät rullning",
		accessibilityLabels: {
			scrollLeftAriaLabel: "Rulla åt vänster",
			scrollRightAriaLabel: "Rulla åt höger",
			scrollPositionAriaLabel: "Rullningsläge",
			scrollPositionText: ({ percentageText }) => `${percentageText} % rullat`
		}
	},
	headerActions: { accessibilityLabels: {
		sortButton: ({ label, sortState, sortPriority, sortCount }) => {
			if (sortState === "none") return `Sortera efter ${label}`;
			const sortDescription = `Sortera efter ${label}, ${sortDirection(sortState)} sortering`;
			return sortPriority !== null && sortCount > 1 ? `${sortDescription}, sortering ${sortPriority} av ${sortCount}` : sortDescription;
		},
		menuButton: ({ label }) => `Kolumnåtgärder för ${label}`,
		menuLabel: ({ label }) => `Kolumnåtgärder för ${label}`,
		pinButton: ({ toggleAction, pinSide }) => {
			return `${toggleAction === "unpin" ? "Lossa" : "Fäst"} ${pinSideText(pinSide, toggleAction)}`;
		},
		pinButtonText: ({ pinSide, toggleAction }) => {
			return `${toggleAction === "unpin" ? "Lossa" : "Fäst"} ${pinSideText(pinSide, toggleAction)}`;
		},
		moveButton: ({ direction }) => `Flytta ${side(direction)}`,
		moveButtonText: ({ direction }) => `Flytta ${side(direction)}`
	} },
	toolbar: { toolbarLabel: "Verktygsfält för tabell" },
	selection: {
		columnLabel: "Markering",
		accessibilityLabels: {
			selectAllAriaLabel: "Markera alla rader",
			selectRowAriaLabel: ({ rowId }) => `Markera rad ${rowId}`
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_SV_RENDER_METRICS_LOCALE_LABELS = {
	renderMetrics: {
		filter: {
			heading: "Renderingshastighet",
			groupAriaLabel: "Radernas renderingshastighet",
			idleCaption: "Visar den senaste uppritningstiden för rader på den aktuella sidan.",
			rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
			options: [
				{
					value: "all",
					label: "Alla rader",
					description: "Visa alla mätta rader"
				},
				{
					value: "fast",
					label: "Snabb",
					description: "Rader som renderades snabbt"
				},
				{
					value: "watch",
					label: "Bevaka",
					description: "Rader som är värda att bevaka"
				},
				{
					value: "slow",
					label: "Långsam",
					description: "Rader som renderades långsamt"
				}
			]
		},
		panel: {
			ariaLabel: "Mätning av radrendering",
			toneLabel: renderToneLabel,
			idleSummary: "inaktiv",
			rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
			duration: ({ durationMsText }) => `${durationMsText} ms`
		},
		column: {
			header: "Rendering",
			pendingLabel: "Väntar",
			unitSuffix: " ms"
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const listKeyboardInstructions$1 = "Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett objekt, Tabb och Skift+Tabb för att flytta mellan dem och Esc för att återgå till objektet.";
const listSummary$1 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
	const fields = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}`;
	let summary;
	if (visibleRowsValue === 0) summary = `Inga objekt visas. ${fields}.`;
	else if (totalRowsValue !== visibleRowsValue) summary = `Visar ${visibleRowsText} av ${totalRowsText} objekt, ${fields}.`;
	else summary = `Visar ${visibleRowsText} objekt, ${fields}.`;
	if (paginationState === "enabled") summary += ` Sida ${pageText} av ${pageCountText}.`;
	return summary;
};
const listColumnVisibilityChange$1 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
	const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;
	if (changedColumns.length === 1) {
		const [column] = changedColumns;
		return `Fältet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
	}
	return summary;
};
const listPageSizeChange$1 = ({ pageCountText, pageSizeText, pageText }) => `${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`;
const listPageChange$1 = ({ pageCountText, pageText, visibleRowsText }) => `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`;
const listSubHeaderRow$1 = ({ valueText, rowCountText }) => {
	return `${valueText.trim() ? `Gruppen ${valueText}` : "Grupp"}, ${rowCountText} objekt.`;
};
const NAT_SV_LOCALE_LABELS = {
	accessibilityText: {
		listKeyboardInstructions: listKeyboardInstructions$1,
		listSummary: listSummary$1,
		listColumnVisibilityChange: listColumnVisibilityChange$1,
		listPageSizeChange: listPageSizeChange$1,
		listPageChange: listPageChange$1,
		listSubHeaderRow: listSubHeaderRow$1,
		keyboardInstructions: "Använd piltangenterna för att flytta mellan celler. Om en cell bara innehåller en kontroll som inte använder piltangenter får kontrollen fokus direkt. Annars trycker du på Retur för att använda kontrollerna, Tabb och Skift+Tabb för att flytta mellan dem och Esc för att återgå till cellen.",
		emptyState: "Inga rader matchar den aktuella vyn.",
		loadingState: "Läser in rader.",
		errorState: "Raderna kunde inte läsas in.",
		reorderKeyboardInstructions: "Tryck på Ctrl+Skift med Vänsterpil eller Högerpil för att flytta en kolumn inom området den är fäst i. Använd Kommando på macOS.",
		resizeKeyboardInstructions: "Tryck på Alt med Vänsterpil eller Högerpil för att ändra kolumnens bredd, eller Alt med Home eller End för minsta eller största bredd.",
		tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
			const columns = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}`;
			let summary;
			if (visibleRowsValue === 0) summary = `Inga rader visas. ${columns}.`;
			else if (totalRowsValue !== visibleRowsValue) summary = `Visar ${visibleRowsText} av ${totalRowsText} ${rows(totalRowsValue)}, ${columns}.`;
			else summary = `Visar ${visibleRowsText} ${rows(visibleRowsValue)}, ${columns}.`;
			if (paginationState === "enabled") summary += ` Sida ${pageText} av ${pageCountText}.`;
			return summary;
		},
		sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
			if (!columnLabel || sortState === "none") return "Sorteringen är rensad.";
			if (sortedColumns.length > 1) {
				const parts = sortedColumns.map((column) => `${column.label} ${sortDirection(column.sortState)}`);
				return `Sorterat efter ${parts.slice(0, -1).join(", ")} och därefter ${parts.at(-1)}.`;
			}
			return `Sorterat efter ${columnLabel} ${sortDirection(sortState)}.`;
		},
		filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
			if (visibleRowsValue === 0) return query ? `Inga rader matchar "${query}".` : "Inga rader matchar de aktuella filtren.";
			if (query) return `${visibleRowsText} ${rows(visibleRowsValue)} matchar "${query}".`;
			if (filterState === "column") return `${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
			return `Alla rader: ${visibleRowsText}.`;
		},
		columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
			const summary = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}.`;
			if (changedColumns.length === 1) {
				const [column] = changedColumns;
				return `Kolumnen ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
			}
			return summary;
		},
		pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${rows(pageSizeValue)} per sida. Sida ${pageText} av ${pageCountText}.`,
		pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} visas.`,
		columnReorder: ({ label, positionText, totalText, zone }) => `Kolumnen ${label} flyttad till position ${positionText} av ${totalText}, ${columnZone(zone)}.`,
		columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolumnen ${label} har bredden ${widthText} pixlar${resizeBoundSuffix$1(atMinimum, atMaximum)}.`,
		selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
			if (selectedCountValue === 0) return "Markeringen är rensad.";
			if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) return `Alla ${totalRowsText} ${selectedRows(totalRowsValue)}.`;
			return `${selectedCountText} ${selectedRows(selectedCountValue)}.`;
		},
		subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
			return `${valueText.trim() ? `Gruppen ${valueText}` : "Grupp"}, ${rowCountText} ${rows(rowCountValue)}.`;
		},
		placeholderRow: () => "Läser in.",
		shortcutLabel: ({ label, shortcutText }) => `${label} (Kortkommando: ${shortcutText})`
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const pluralize = (label, count) => count === 1 ? label : `${label}s`;
const listSubHeaderRow = ({ valueText, rowCountValue, rowCountText }) => {
	return `${valueText.trim() ? `${valueText} group` : "Group"}, ${rowCountText} ${pluralize("item", rowCountValue)}.`;
};
const listKeyboardInstructions = "Use Up and Down arrows to move between items. Press Enter to use the controls in an item, Tab and Shift+Tab to move between them, and Escape to return to the item.";
const listSummary = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
	let summary;
	if (visibleRowsValue === 0) summary = `No items shown. ${visibleColumnsText} visible ${pluralize("field", visibleColumnsValue)}.`;
	else if (totalRowsValue !== visibleRowsValue) summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize("item", totalRowsValue)}, ${visibleColumnsText} visible ${pluralize("field", visibleColumnsValue)}.`;
	else summary = `Showing ${visibleRowsText} ${pluralize("item", visibleRowsValue)}, ${visibleColumnsText} visible ${pluralize("field", visibleColumnsValue)}.`;
	if (paginationState === "enabled") summary += ` Page ${pageText} of ${pageCountText}.`;
	return summary;
};
const listColumnVisibilityChange = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
	if (changedColumns.length === 1) {
		const [column] = changedColumns;
		return `${column.label} field ${column.visibilityState === "visible" ? "shown" : "hidden"}. ${visibleColumnsText} visible ${pluralize("field", visibleColumnsValue)}.`;
	}
	return `${visibleColumnsText} visible ${pluralize("field", visibleColumnsValue)}.`;
};
const listPageSizeChange = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${pluralize("item", pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`;
const listPageChange = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize("item", visibleRowsValue)} shown.`;
const describeColumnZone = (zone) => {
	if (zone === "left") return "left pinned";
	if (zone === "right") return "right pinned";
	return "unpinned";
};
const resizeBoundSuffix = (atMinimum, atMaximum) => {
	if (atMinimum) return " (minimum)";
	if (atMaximum) return " (maximum)";
	return "";
};
const NAT_EN_LOCALE_LABELS = {
	accessibilityText: {
		listSubHeaderRow,
		listKeyboardInstructions,
		listSummary,
		listColumnVisibilityChange,
		listPageSizeChange,
		listPageChange,
		keyboardInstructions: "Use arrow keys to move between cells. A cell whose only content is one control that does not need arrow keys focuses it directly. Elsewhere, press Enter to use the controls in a cell, Tab and Shift+Tab to move between them, and Escape to return to the cell.",
		emptyState: "No rows match the current view.",
		loadingState: "Loading rows.",
		errorState: "Rows could not be loaded.",
		reorderKeyboardInstructions: "Press Control+Shift with Left or Right Arrow to reorder a column within its pinned region. Use Command on macOS.",
		resizeKeyboardInstructions: "Press Alt with Left or Right Arrow to resize a column, or Alt with Home or End for its minimum or maximum width.",
		tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
			let summary;
			if (visibleRowsValue === 0) summary = `No rows shown. ${visibleColumnsText} visible ${pluralize("column", visibleColumnsValue)}.`;
			else if (totalRowsValue !== visibleRowsValue) summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize("row", totalRowsValue)}, ${visibleColumnsText} visible ${pluralize("column", visibleColumnsValue)}.`;
			else summary = `Showing ${visibleRowsText} ${pluralize("row", visibleRowsValue)}, ${visibleColumnsText} visible ${pluralize("column", visibleColumnsValue)}.`;
			if (paginationState === "enabled") summary += ` Page ${pageText} of ${pageCountText}.`;
			return summary;
		},
		sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
			if (!columnLabel || sortState === "none") return "Sorting cleared.";
			if (sortedColumns.length > 1) {
				const parts = sortedColumns.map((column) => `${column.label} ${column.sortState}`);
				return `Sorted by ${parts.slice(0, -1).join(", ")}, then ${parts.at(-1)}.`;
			}
			return `Sorted by ${columnLabel} ${sortState}.`;
		},
		filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
			if (visibleRowsValue === 0) return query ? `No rows match "${query}".` : "No rows match the current filters.";
			if (query) return `${visibleRowsText} ${pluralize("row", visibleRowsValue)} ${visibleRowsValue === 1 ? "matches" : "match"} "${query}".`;
			if (filterState === "column") return `${visibleRowsText} filtered ${pluralize("row", visibleRowsValue)}.`;
			return `All ${visibleRowsText} ${pluralize("row", visibleRowsValue)}.`;
		},
		columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
			if (changedColumns.length === 1) {
				const [column] = changedColumns;
				return `${column.label} column ${column.visibilityState === "visible" ? "shown" : "hidden"}. ${visibleColumnsText} visible ${pluralize("column", visibleColumnsValue)}.`;
			}
			return `${visibleColumnsText} visible ${pluralize("column", visibleColumnsValue)}.`;
		},
		pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `${pageSizeText} ${pluralize("row", pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`,
		pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize("row", visibleRowsValue)} shown.`,
		columnReorder: ({ label, positionText, totalText, zone }) => `${label} column moved to position ${positionText} of ${totalText}, ${describeColumnZone(zone)}.`,
		columnResize: ({ label, widthText, atMinimum, atMaximum }) => `${label} column width ${widthText} pixels${resizeBoundSuffix(atMinimum, atMaximum)}.`,
		selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
			if (selectedCountValue === 0) return "Selection cleared.";
			if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) return `All ${totalRowsText} ${pluralize("row", totalRowsValue)} selected.`;
			return `${selectedCountText} ${pluralize("row", selectedCountValue)} selected.`;
		},
		subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
			return `${valueText.trim() ? `${valueText} group` : "Group"}, ${rowCountText} ${pluralize("row", rowCountValue)}.`;
		},
		placeholderRow: () => "Loading.",
		shortcutLabel: ({ label, shortcutText }) => `${label} (Shortcut: ${shortcutText})`
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_TABLE_BUILT_IN_LOCALES = { ["en"]: NAT_EN_LOCALE_LABELS };
const NAT_EN_CONTROLS_LOCALE_LABELS = {
	search: {
		label: "Search rows",
		placeholder: "Search rows"
	},
	columnVisibility: {
		label: "Columns",
		groupAriaLabel: "Column visibility",
		accessibilityLabels: {
			visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} visible`,
			toggleColumnAriaLabel: ({ columnLabel, visibilityState }) => `${columnLabel}, ${visibilityState === "visible" ? "shown" : "hidden"}`,
			columnState: ({ visibilityState }) => visibilityState === "visible" ? "Shown" : "Hidden"
		}
	},
	pageSize: {
		groupAriaLabel: "Rows per page",
		accessibilityLabels: {
			pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rows`,
			pageSizeOptionAriaLabel: ({ pageSizeText }) => `${pageSizeText} rows`
		}
	},
	pager: {
		groupAriaLabel: "Table pagination",
		accessibilityLabels: {
			previousPageAriaLabel: "Previous page",
			nextPageAriaLabel: "Next page",
			pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
		}
	},
	scrollControl: {
		groupAriaLabel: "Horizontal scroll",
		accessibilityLabels: {
			scrollLeftAriaLabel: "Scroll left",
			scrollRightAriaLabel: "Scroll right",
			scrollPositionAriaLabel: "Scroll position",
			scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`
		}
	},
	headerActions: { accessibilityLabels: {
		sortButton: ({ label, sortState, sortPriority, sortCount }) => {
			if (sortState === "none") return `Sort by ${label}`;
			const sortDescription = `Sort by ${label}, sorted ${sortState}`;
			return sortPriority !== null && sortCount > 1 ? `${sortDescription}, sort ${sortPriority} of ${sortCount}` : sortDescription;
		},
		menuButton: ({ label }) => `${label} column actions`,
		menuLabel: ({ label }) => `${label} column actions`,
		pinButton: ({ toggleAction, pinSide }) => `${toggleAction === "unpin" ? "Unpin" : "Pin"} ${pinSide}`,
		pinButtonText: ({ pinSide, toggleAction }) => `${toggleAction === "unpin" ? "Unpin" : "Pin"} ${pinSide}`,
		moveButton: ({ direction }) => `Move ${direction}`,
		moveButtonText: ({ direction }) => `Move ${direction}`
	} },
	toolbar: { toolbarLabel: "Table toolbar" },
	selection: {
		columnLabel: "Selection",
		accessibilityLabels: {
			selectAllAriaLabel: "Select all rows",
			selectRowAriaLabel: ({ rowId }) => `Select row ${rowId}`
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_TABLE_BUILT_IN_CONTROLS_LOCALES = { ["en"]: NAT_EN_CONTROLS_LOCALE_LABELS };
const RENDER_METRICS_FILTER_OPTIONS = [
	{
		value: "all",
		label: "All rows",
		description: "Show every measured row"
	},
	{
		value: "fast",
		label: "Fast",
		description: "Rows that rendered quickly"
	},
	{
		value: "watch",
		label: "Watch",
		description: "Rows worth watching"
	},
	{
		value: "slow",
		label: "Slow",
		description: "Rows that rendered slowly"
	}
];
const getRenderToneLabel = (tone) => {
	switch (tone) {
		case "fast": return "Fast";
		case "watch": return "Watch";
		case "slow": return "Slow";
		case "idle": return "Idle";
	}
};
const NAT_EN_RENDER_METRICS_LOCALE_LABELS = {
	renderMetrics: {
		filter: {
			heading: "Render speed",
			groupAriaLabel: "Row render speed",
			idleCaption: "Captures the latest row paint time for the current page.",
			rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} visible ${rowCountValue === 1 ? "row" : "rows"} sampled`,
			options: RENDER_METRICS_FILTER_OPTIONS
		},
		panel: {
			ariaLabel: "Row render sample",
			toneLabel: getRenderToneLabel,
			idleSummary: "idle",
			rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${rowCountValue === 1 ? "row" : "rows"} sampled`,
			duration: ({ durationMsText }) => `${durationMsText} ms`
		},
		column: {
			header: "Render",
			pendingLabel: "Pending",
			unitSuffix: " ms"
		}
	},
	formatNumber: DEFAULT_NUMBER_FORMATTER
};
const NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES = { ["en"]: NAT_EN_RENDER_METRICS_LOCALE_LABELS };
const isSignalOf = (value) => isSignal(value);
const resolveNatTableProviderConfig = (config) => {
	if (isSignalOf(config)) return config;
	const resolved = typeof config === "function" ? config() : config;
	return isSignalOf(resolved) ? resolved : computed(() => resolved);
};
const createLiveConfigFacade = (config) => ({ get locales() {
	return config().locales;
} });
const mapNatTableProviderConfig = (config, map) => {
	if (isSignalOf(config)) return computed(() => map(config()));
	if (typeof config === "function") return () => {
		const resolved = config();
		return isSignalOf(resolved) ? computed(() => map(resolved())) : map(resolved);
	};
	return map(config);
};
const createNatTableMergedProvider = (token, defaultConfig, config, mergeConfig) => {
	return [{
		provide: token,
		deps: [[
			new Optional(),
			new SkipSelf(),
			token
		]],
		useFactory: (parent) => {
			const source = resolveNatTableProviderConfig(config);
			const merged = computed(() => mergeConfig(parent ?? defaultConfig, source()), ...ngDevMode ? [{ debugName: "merged" }] : /* istanbul ignore next */ []);
			return createLiveConfigFacade(merged);
		}
	}];
};
const findRegisteredId = (locales, candidate) => {
	if (locales[candidate] !== void 0) return candidate;
	const folded = candidate.toLowerCase();
	return Object.keys(locales).find((id) => id.toLowerCase() === folded && locales[id] !== void 0) ?? null;
};
const matchNatTableLocaleId = (locales, localeId) => {
	if (!locales) return null;
	let candidate = localeId;
	while (candidate.length > 0) {
		const registeredId = findRegisteredId(locales, candidate);
		if (registeredId !== null) return registeredId;
		const lastSeparator = candidate.lastIndexOf("-");
		if (lastSeparator < 0) return null;
		candidate = candidate.slice(0, lastSeparator);
		const singletonAt = candidate.lastIndexOf("-");
		if (singletonAt >= 0 && candidate.length - singletonAt === 2) candidate = candidate.slice(0, singletonAt);
	}
	return null;
};
const mergeAccessibilityInstructions = (parent, override) => ({
	description: override?.description ?? parent?.description,
	keyboardInstructions: override?.keyboardInstructions ?? parent?.keyboardInstructions,
	listKeyboardInstructions: override?.listKeyboardInstructions ?? parent?.listKeyboardInstructions
});
const mergeAccessibilityStateText = (parent, override) => ({
	emptyState: override?.emptyState ?? parent?.emptyState,
	loadingState: override?.loadingState ?? parent?.loadingState,
	errorState: override?.errorState ?? parent?.errorState
});
const mergeAccessibilityGestureText = (parent, override) => ({
	reorderKeyboardInstructions: override?.reorderKeyboardInstructions ?? parent?.reorderKeyboardInstructions,
	resizeKeyboardInstructions: override?.resizeKeyboardInstructions ?? parent?.resizeKeyboardInstructions
});
const mergeAccessibilitySummaryAnnouncers = (parent, override) => ({
	tableSummary: override?.tableSummary ?? parent?.tableSummary,
	listSummary: override?.listSummary ?? parent?.listSummary,
	sortingChange: override?.sortingChange ?? parent?.sortingChange,
	filteringChange: override?.filteringChange ?? parent?.filteringChange
});
const mergeAccessibilityPaginationAnnouncers = (parent, override) => ({
	columnVisibilityChange: override?.columnVisibilityChange ?? parent?.columnVisibilityChange,
	listColumnVisibilityChange: override?.listColumnVisibilityChange ?? parent?.listColumnVisibilityChange,
	pageSizeChange: override?.pageSizeChange ?? parent?.pageSizeChange,
	listPageSizeChange: override?.listPageSizeChange ?? parent?.listPageSizeChange,
	pageChange: override?.pageChange ?? parent?.pageChange,
	listPageChange: override?.listPageChange ?? parent?.listPageChange
});
const mergeAccessibilityColumnAnnouncers = (parent, override) => ({
	columnReorder: override?.columnReorder ?? parent?.columnReorder,
	columnResize: override?.columnResize ?? parent?.columnResize,
	selectionChange: override?.selectionChange ?? parent?.selectionChange
});
const mergeAccessibilitySubHeaderText = (parent, override) => ({
	subHeaderRow: override?.subHeaderRow ?? parent?.subHeaderRow,
	listSubHeaderRow: override?.listSubHeaderRow ?? parent?.listSubHeaderRow,
	placeholderRow: override?.placeholderRow ?? parent?.placeholderRow
});
const mergeAccessibilityShortcutText = (parent, override) => ({ shortcutLabel: override?.shortcutLabel ?? parent?.shortcutLabel });
const mergeNatTableAccessibilityText = (parent, override) => ({
	...mergeAccessibilityInstructions(parent, override),
	...mergeAccessibilityStateText(parent, override),
	...mergeAccessibilityGestureText(parent, override),
	...mergeAccessibilitySummaryAnnouncers(parent, override),
	...mergeAccessibilityPaginationAnnouncers(parent, override),
	...mergeAccessibilityColumnAnnouncers(parent, override),
	...mergeAccessibilitySubHeaderText(parent, override),
	...mergeAccessibilityShortcutText(parent, override)
});
const mergeNatTableIntl = (parent, override) => ({
	accessibilityText: mergeNatTableAccessibilityText(parent?.accessibilityText, override?.accessibilityText),
	formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeLocaleMaps$2 = (parentLocales, overrideLocales) => {
	const merged = {};
	for (const [localeId, labels] of Object.entries(parentLocales)) merged[localeId] = mergeNatTableIntl(void 0, labels);
	for (const [localeId, labels] of Object.entries(overrideLocales)) merged[localeId] = mergeNatTableIntl(merged[localeId], labels);
	return merged;
};
const isIntlConfig = (config) => "locales" in config;
const normalizeIntlProviderConfig = (config) => {
	if (isIntlConfig(config)) return config;
	return { locales: { ["en"]: config } };
};
const mergeNatTableIntlConfig = (parent, override) => {
	const overrideConfig = normalizeIntlProviderConfig(override);
	return { locales: mergeLocaleMaps$2(parent.locales ?? {}, overrideConfig.locales ?? {}) };
};
const formatNatTableNumber = (intl, value, options, locale) => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
const resolveNatTableIntl = (intl, locale) => {
	const englishIntl = intl.locales?.["en"] ?? NAT_EN_LOCALE_LABELS;
	const matchedId = matchNatTableLocaleId(intl.locales, locale);
	return mergeNatTableIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : void 0) ?? {});
};
const NAT_TABLE_DEFAULT_INTL = { locales: NAT_TABLE_BUILT_IN_LOCALES };
const NAT_TABLE_INTL = new InjectionToken("NAT_TABLE_INTL", {
	providedIn: "root",
	factory: () => NAT_TABLE_DEFAULT_INTL
});
const provideNatTableIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_INTL, NAT_TABLE_DEFAULT_INTL, intl, mergeNatTableIntlConfig);
const provideNatTableLocales = (overrides = {}) => provideNatTableIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
const mergeColumnVisibilityText = (parent, override) => ({
	heading: override?.heading ?? parent?.heading,
	groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel
});
const mergeColumnVisibilityFormatters = (parent, override) => ({
	visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
	toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
	columnState: override?.columnState ?? parent?.columnState
});
const mergeColumnVisibilityLabels = (parent, override) => ({
	...mergeColumnVisibilityText(parent, override),
	...mergeColumnVisibilityFormatters(parent, override)
});
const mergePageSizeLabels = (parent, override) => ({
	groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
	pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
	pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel
});
const mergePagerButtonLabels = (parent, override) => ({
	groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
	previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel
});
const mergePagerIndicatorLabels = (parent, override) => ({
	nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
	pageIndicator: override?.pageIndicator ?? parent?.pageIndicator
});
const mergePagerLabels = (parent, override) => ({
	...mergePagerButtonLabels(parent, override),
	...mergePagerIndicatorLabels(parent, override)
});
const mergeScrollControlButtonLabels = (parent, override) => ({
	groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
	scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
	scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel
});
const mergeScrollControlPositionLabels = (parent, override) => ({
	scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
	scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText
});
const mergeScrollControlLabels = (parent, override) => ({
	...mergeScrollControlButtonLabels(parent, override),
	...mergeScrollControlPositionLabels(parent, override)
});
const mergeSelectionLabels = (parent, override) => ({
	selectAllAriaLabel: override?.selectAllAriaLabel ?? parent?.selectAllAriaLabel,
	selectRowAriaLabel: override?.selectRowAriaLabel ?? parent?.selectRowAriaLabel
});
const mergeHeaderSortAndMenuLabels = (parent, override) => ({
	sortButton: override?.sortButton ?? parent?.sortButton,
	menuButton: override?.menuButton ?? parent?.menuButton,
	menuLabel: override?.menuLabel ?? parent?.menuLabel
});
const mergeHeaderPinLabels = (parent, override) => ({
	pinButton: override?.pinButton ?? parent?.pinButton,
	pinButtonText: override?.pinButtonText ?? parent?.pinButtonText
});
const mergeHeaderMoveLabels = (parent, override) => ({
	moveButton: override?.moveButton ?? parent?.moveButton,
	moveButtonText: override?.moveButtonText ?? parent?.moveButtonText
});
const mergeHeaderActionLabels = (parent, override) => ({
	...mergeHeaderSortAndMenuLabels(parent, override),
	...mergeHeaderPinLabels(parent, override),
	...mergeHeaderMoveLabels(parent, override)
});
const mergeDefined = (parent, override) => {
	return {
		...parent,
		...override
	};
};
const mergeColumnVisibilitySlice = (parent, override) => ({
	...mergeDefined(parent?.columnVisibility, override.columnVisibility),
	accessibilityLabels: mergeColumnVisibilityLabels(parent?.columnVisibility?.accessibilityLabels, override.columnVisibility?.accessibilityLabels)
});
const mergePageSizeSlice = (parent, override) => ({
	...mergeDefined(parent?.pageSize, override.pageSize),
	accessibilityLabels: mergePageSizeLabels(parent?.pageSize?.accessibilityLabels, override.pageSize?.accessibilityLabels)
});
const mergePagerSlice = (parent, override) => ({
	...mergeDefined(parent?.pager, override.pager),
	accessibilityLabels: mergePagerLabels(parent?.pager?.accessibilityLabels, override.pager?.accessibilityLabels)
});
const mergeScrollControlSlice = (parent, override) => ({
	...mergeDefined(parent?.scrollControl, override.scrollControl),
	accessibilityLabels: mergeScrollControlLabels(parent?.scrollControl?.accessibilityLabels, override.scrollControl?.accessibilityLabels)
});
const mergeHeaderActionsSlice = (parent, override) => ({ accessibilityLabels: mergeHeaderActionLabels(parent?.headerActions?.accessibilityLabels, override.headerActions?.accessibilityLabels) });
const mergeSelectionSlice = (parent, override) => ({
	...mergeDefined(parent?.selection, override.selection),
	accessibilityLabels: mergeSelectionLabels(parent?.selection?.accessibilityLabels, override.selection?.accessibilityLabels)
});
const mergeNatTableControlsIntl = (parent, override) => ({
	search: mergeDefined(parent?.search, override.search),
	columnVisibility: mergeColumnVisibilitySlice(parent, override),
	pageSize: mergePageSizeSlice(parent, override),
	pager: mergePagerSlice(parent, override),
	scrollControl: mergeScrollControlSlice(parent, override),
	headerActions: mergeHeaderActionsSlice(parent, override),
	toolbar: mergeDefined(parent?.toolbar, override.toolbar),
	selection: mergeSelectionSlice(parent, override),
	formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeNatTableControlsLocaleIntl = (parent, override) => mergeNatTableControlsIntl(parent, override ?? {});
const mergeLocaleMaps$1 = (parentLocales, overrideLocales) => {
	const merged = {};
	for (const [localeId, labels] of Object.entries(parentLocales)) merged[localeId] = mergeNatTableControlsLocaleIntl(void 0, labels);
	for (const [localeId, labels] of Object.entries(overrideLocales)) merged[localeId] = mergeNatTableControlsLocaleIntl(merged[localeId], labels);
	return merged;
};
const isControlsIntlConfig = (config) => "locales" in config;
const normalizeControlsIntlProviderConfig = (config) => {
	if (isControlsIntlConfig(config)) return config;
	return { locales: { ["en"]: config } };
};
const mergeNatTableControlsIntlConfig = (parent, override) => {
	const overrideConfig = normalizeControlsIntlProviderConfig(override);
	return { locales: mergeLocaleMaps$1(parent.locales ?? {}, overrideConfig.locales ?? {}) };
};
const resolveNatTableControlsIntl = (intl, locale) => {
	const englishIntl = intl.locales?.["en"] ?? NAT_EN_CONTROLS_LOCALE_LABELS;
	const matchedId = matchNatTableLocaleId(intl.locales, locale);
	return mergeNatTableControlsIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : void 0) ?? {});
};
const NAT_TABLE_CONTROLS_DEFAULT_INTL = { locales: NAT_TABLE_BUILT_IN_CONTROLS_LOCALES };
const NAT_TABLE_CONTROLS_INTL = new InjectionToken("NAT_TABLE_CONTROLS_INTL", {
	providedIn: "root",
	factory: () => NAT_TABLE_CONTROLS_DEFAULT_INTL
});
const provideNatTableControlsIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_CONTROLS_INTL, NAT_TABLE_CONTROLS_DEFAULT_INTL, intl, mergeNatTableControlsIntlConfig);
const provideNatTableControlsLocales = (overrides = {}) => provideNatTableControlsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
const mergeRenderMetricsFilterText = (parent, override) => ({
	heading: override?.heading ?? parent?.heading,
	groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
	idleCaption: override?.idleCaption ?? parent?.idleCaption
});
const mergeRenderMetricsFilterFormatters = (parent, override) => ({
	rowSampleCaption: override?.rowSampleCaption ?? parent?.rowSampleCaption,
	options: override?.options ?? parent?.options
});
const mergeRenderMetricsFilterIntl = (parent, override) => ({
	...mergeRenderMetricsFilterText(parent, override),
	...mergeRenderMetricsFilterFormatters(parent, override)
});
const mergeRenderMetricsPanelText = (parent, override) => ({
	ariaLabel: override?.ariaLabel ?? parent?.ariaLabel,
	toneLabel: override?.toneLabel ?? parent?.toneLabel,
	idleSummary: override?.idleSummary ?? parent?.idleSummary
});
const mergeRenderMetricsPanelFormatters = (parent, override) => ({
	rowSampleSummary: override?.rowSampleSummary ?? parent?.rowSampleSummary,
	duration: override?.duration ?? parent?.duration
});
const mergeRenderMetricsPanelIntl = (parent, override) => ({
	...mergeRenderMetricsPanelText(parent, override),
	...mergeRenderMetricsPanelFormatters(parent, override)
});
const mergeRenderMetricsColumnText = (parent, override) => ({
	header: override?.header ?? parent?.header,
	pendingLabel: override?.pendingLabel ?? parent?.pendingLabel
});
const mergeRenderMetricsColumnFormatters = (parent, override) => ({
	unitSuffix: override?.unitSuffix ?? parent?.unitSuffix,
	duration: override?.duration ?? parent?.duration
});
const mergeRenderMetricsColumnIntl = (parent, override) => ({
	...mergeRenderMetricsColumnText(parent, override),
	...mergeRenderMetricsColumnFormatters(parent, override)
});
const mergeRenderMetricsWidgetsIntl = (parent, override) => ({
	filter: mergeRenderMetricsFilterIntl(parent?.filter, override?.filter),
	panel: mergeRenderMetricsPanelIntl(parent?.panel, override?.panel),
	column: mergeRenderMetricsColumnIntl(parent?.column, override?.column)
});
const mergeNatTableRenderMetricsIntl = (parent, override) => ({
	renderMetrics: mergeRenderMetricsWidgetsIntl(parent?.renderMetrics, override.renderMetrics),
	formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeNatTableRenderMetricsLocaleIntl = (parent, override) => mergeNatTableRenderMetricsIntl(parent, override ?? {});
const mergeLocaleMaps = (parentLocales, overrideLocales) => {
	const merged = {};
	for (const [localeId, labels] of Object.entries(parentLocales)) merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(void 0, labels);
	for (const [localeId, labels] of Object.entries(overrideLocales)) merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(merged[localeId], labels);
	return merged;
};
const isRenderMetricsIntlConfig = (config) => "locales" in config;
const normalizeRenderMetricsIntlProviderConfig = (config) => {
	if (isRenderMetricsIntlConfig(config)) return config;
	return { locales: { ["en"]: config } };
};
const mergeNatTableRenderMetricsIntlConfig = (parent, override) => {
	const overrideConfig = normalizeRenderMetricsIntlProviderConfig(override);
	return { locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {}) };
};
const formatNatTableRenderMetricsNumber = (intl, value, options, locale) => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
const resolveNatTableRenderMetricsIntl = (intl, locale) => {
	const englishIntl = intl.locales?.["en"] ?? NAT_EN_RENDER_METRICS_LOCALE_LABELS;
	const matchedId = matchNatTableLocaleId(intl.locales, locale);
	return mergeNatTableRenderMetricsIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : void 0) ?? {});
};
const NAT_TABLE_RENDER_METRICS_DEFAULT_INTL = { locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES };
const NAT_TABLE_RENDER_METRICS_INTL = new InjectionToken("NAT_TABLE_RENDER_METRICS_INTL", {
	providedIn: "root",
	factory: () => NAT_TABLE_RENDER_METRICS_DEFAULT_INTL
});
const provideNatTableRenderMetricsIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_RENDER_METRICS_INTL, NAT_TABLE_RENDER_METRICS_DEFAULT_INTL, intl, mergeNatTableRenderMetricsIntlConfig);
const provideNatTableRenderMetricsLocales = (overrides = {}) => provideNatTableRenderMetricsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
const injectNatTableRenderMetricsIntl = () => {
	try {
		assertInInjectionContext(injectNatTableRenderMetricsIntl);
	} catch {
		return NAT_TABLE_RENDER_METRICS_DEFAULT_INTL;
	}
	return inject(NAT_TABLE_RENDER_METRICS_INTL);
};
export { NAT_DA_CONTROLS_LOCALE_LABELS, NAT_DA_LOCALE_ID, NAT_DA_LOCALE_LABELS, NAT_DA_RENDER_METRICS_LOCALE_LABELS, NAT_EN_CONTROLS_LOCALE_LABELS, NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS, NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_FI_CONTROLS_LOCALE_LABELS, NAT_FI_LOCALE_ID, NAT_FI_LOCALE_LABELS, NAT_FI_RENDER_METRICS_LOCALE_LABELS, NAT_NB_CONTROLS_LOCALE_LABELS, NAT_NB_LOCALE_ID, NAT_NB_LOCALE_LABELS, NAT_NB_RENDER_METRICS_LOCALE_LABELS, NAT_NO_LOCALE_ID, NAT_SV_CONTROLS_LOCALE_LABELS, NAT_SV_LOCALE_ID, NAT_SV_LOCALE_LABELS, NAT_SV_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES, NAT_TABLE_BUILT_IN_LOCALES, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES, NAT_TABLE_CONTROLS_INTL, NAT_TABLE_INTL, NAT_TABLE_RENDER_METRICS_INTL, RENDER_METRICS_FILTER_OPTIONS, formatNatTableNumber, formatNatTableRenderMetricsNumber, injectNatTableRenderMetricsIntl, matchNatTableLocaleId, mergeColumnVisibilityLabels, mergeHeaderActionLabels, mergeNatTableAccessibilityText, mergePageSizeLabels, mergePagerLabels, mergeRenderMetricsColumnIntl, mergeRenderMetricsFilterIntl, mergeRenderMetricsPanelIntl, mergeScrollControlLabels, mergeSelectionLabels, provideNatTableControlsIntl, provideNatTableControlsLocales, provideNatTableIntl, provideNatTableLocales, provideNatTableRenderMetricsIntl, provideNatTableRenderMetricsLocales, resolveNatTableControlsIntl, resolveNatTableIntl, resolveNatTableRenderMetricsIntl };

//# sourceMappingURL=ng-advanced-table-locale.mjs.map