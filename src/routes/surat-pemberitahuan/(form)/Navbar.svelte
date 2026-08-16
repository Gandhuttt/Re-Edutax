<script lang="ts">
    interface Props {
        tabs: {tab: string, visibility: boolean}[];
        currentTab: string | {};
        specialLabel?: (tab: string) => string;
    }

    let { tabs, currentTab = $bindable(), specialLabel }: Props = $props();
</script>

<header class="tw:mb-5">
    <nav class="tw:overflow-x-auto tw:border-b tw:border-[#A9A9A9]">
        <ul class="tw:m-0! tw:flex tw:min-w-max tw:flex-row tw:p-0!">
            {#each tabs as tab}
                <li class:active-tab={currentTab === tab.tab} aria-hidden={!tab.visibility} inert={!tab.visibility}>
                    <button type="button" onclick={() => currentTab = tab.tab}>{specialLabel ? specialLabel(tab.tab) : tab.tab}</button>
                </li>
            {/each}
        </ul>
    </nav>
</header>

<style>
	nav button {
		padding: 1rem;
	}

	nav li {
		position: relative;
	}

	nav li::before {
		bottom: 0;
		left: 0;
		height: 1px;
		width: 0;
		background-color: brown;
		content: '';
		position: absolute;
		transition: 300ms;
	}

	nav li:hover::before,
	nav li.active-tab::before {
		width: 100%;
	}

	li[aria-hidden="true"] {display: none;}
</style>