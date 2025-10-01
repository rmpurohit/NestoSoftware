<template>
  <div class="app">
    <header class="app__header">
      <h1>Shift Schedule Overview</h1>
      <p>
        This page loads the organization structure and timetables from the API.
        Pick a store to see the assigned employees and their time ranges.
      </p>
    </header>

    <main class="app__main">
      <section v-if="isOverviewLoading" class="card">
        <p>Loading organization data…</p>
      </section>

      <section v-else-if="overviewError" class="card card--error">
        <p>{{ overviewError }}</p>
      </section>

      <template v-else>
        <section class="card">
          <h2>Store selection</h2>
          <label class="store-picker">
            <span>Store</span>
            <select v-model="selectedStoreName">
              <option value="" disabled>Select a store</option>
              <option
                v-for="store in availableStores"
                :key="store"
                :value="store"
              >
                {{ store }}
              </option>
            </select>
          </label>
          <p class="helper-text">
            Employees available in all stores: {{ totalEmployees }}
          </p>
        </section>

        <section class="card">
          <h2>Organization structure</h2>
          <p v-if="!headquarter">No organization data available.</p>
          <OrganizationNodeList
            v-else
            :nodes="[headquarter]"
          />
        </section>

        <section class="card">
          <h2>Shift schedule</h2>
          <div v-if="isTimetableLoading">
            <p>Loading timetable…</p>
          </div>
          <div v-else-if="timetableError" class="card card--error">
            <p>{{ timetableError }}</p>
          </div>
          <div v-else-if="selectedTimetable">
            <table class="timetable">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Time ranges</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in selectedTimetable.entries"
                  :key="entry.name"
                >
                  <td>{{ entry.name }}</td>
                  <td>
                    <ul class="time-range-list">
                      <li v-for="range in entry.ranges" :key="range.start + range.end">
                        {{ range.start }} – {{ range.end }}
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p>Please select a store to load its timetable.</p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from "vue";
import type {
  OrganizationNode,
  OrganizationOverview,
  Timetable
} from "@/types/organization";
import {
  fetchOrganizationOverview,
  fetchTimetableForStore
} from "@/api/organizationService";
import type { PropType } from "vue";

const overview = ref<OrganizationOverview | null>(null);
const selectedStoreName = ref("");
const selectedTimetable = ref<Timetable | null>(null);
const isOverviewLoading = ref(false);
const isTimetableLoading = ref(false);
const overviewError = ref("");
const timetableError = ref("");
let lastRequestedStore = "";

const availableStores = computed(() => overview.value?.stores ?? []);
const totalEmployees = computed(() => overview.value?.employees.length ?? 0);
const headquarter = computed(() => overview.value?.headquarter ?? null);

const OrganizationNodeList = defineComponent({
  name: "OrganizationNodeList",
  props: {
    nodes: {
      type: Array as PropType<OrganizationNode[]>,
      required: true
    }
  },
  setup(props) {
    const renderNode = (node: OrganizationNode) => {
      if (node.type === "store") {
        return h("li", { class: "structure__item" }, [
          h("div", { class: "structure__title" }, node.name),
          node.employees.length
            ? h(
                "ul",
                { class: "structure__employees" },
                node.employees.map(employee => h("li", employee))
              )
            : null
        ]);
      }

      return h("li", { class: "structure__item" }, [
        h("div", { class: "structure__title" }, [
          node.name,
          node.type === "area" && node.manager
            ? ` (manager: ${node.manager})`
            : ""
        ]),
        node.children?.length
          ? h(OrganizationNodeList, { nodes: node.children })
          : null
      ]);
    };

    return () =>
      h(
        "ul",
        { class: "structure__list" },
        props.nodes.map(renderNode)
      );
  }
});

const loadOverview = async () => {
  isOverviewLoading.value = true;
  overviewError.value = "";
  try {
    const data = await fetchOrganizationOverview();
    overview.value = data;

    if (!selectedStoreName.value) {
      selectedStoreName.value =
        data.timetables[0]?.storeName ?? data.stores[0] ?? "";
    }
  } catch (error) {
    overviewError.value =
      error instanceof Error ? error.message : "Unknown error";
  } finally {
    isOverviewLoading.value = false;
  }
};

const loadTimetable = async (storeName: string) => {
  if (!storeName) {
    selectedTimetable.value = null;
    timetableError.value = "";
    isTimetableLoading.value = false;
    lastRequestedStore = "";
    return;
  }

  isTimetableLoading.value = true;
  timetableError.value = "";
  lastRequestedStore = storeName;
  try {
    const timetable = await fetchTimetableForStore(storeName);
    if (lastRequestedStore === storeName) {
      selectedTimetable.value = timetable;
    }
  } catch (error) {
    if (lastRequestedStore === storeName) {
      timetableError.value =
        error instanceof Error ? error.message : "Unknown error";
      selectedTimetable.value = null;
    }
  } finally {
    if (lastRequestedStore === storeName) {
      isTimetableLoading.value = false;
    }
  }
};

watch(selectedStoreName, storeName => {
  if (storeName) {
    loadTimetable(storeName);
  } else {
    selectedTimetable.value = null;
  }
});

onMounted(() => {
  loadOverview();
});
</script>

<style scoped>
.app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app__header h1 {
  margin: 0 0 0.5rem;
}

.app__header p {
  margin: 0;
}

.app__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}

.card--error {
  border-color: #d93025;
  background: #ffe8e6;
  color: #8b1a13;
}

.store-picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 260px;
}

.store-picker select {
  padding: 0.4rem;
}

.helper-text {
  margin-top: 0.75rem;
  color: #555;
}

.structure__list {
  margin: 0;
  padding-left: 1.25rem;
}

.structure__item {
  margin-bottom: 0.5rem;
}

.structure__title {
  font-weight: 600;
}

.structure__employees {
  margin: 0.25rem 0 0;
  padding-left: 1rem;
}

.timetable {
  width: 100%;
  border-collapse: collapse;
}

.timetable th,
.timetable td {
  border: 1px solid #d0d7de;
  padding: 0.5rem;
  text-align: left;
}

.time-range-list {
  margin: 0;
  padding-left: 1.25rem;
}

@media (max-width: 600px) {
  .app {
    padding: 1rem;
  }

  .store-picker {
    max-width: 100%;
  }
}
</style>
