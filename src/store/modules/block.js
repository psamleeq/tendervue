const state = {
	blockGeo: {}
}

const mutations = {
	SET_BLOCK: (state, { tenderRound, JSONString }) => {
		state.blockGeo[tenderRound] = JSONString;
	},
	RESET_BLOCK: (state) => {
		state.blockGeo = {};
	}
}

const actions = {
	setGeoJSON({ commit }, { tenderRound, JSONString }) {
		commit('SET_BLOCK', { tenderRound, JSONString });
	},
	resetGeoJSON({ commit }) {
		commit('RESET_BLOCK', {});
	},
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
