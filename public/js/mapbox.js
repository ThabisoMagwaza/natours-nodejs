/* eslint-disable */
export const drawMap = (locations) => {
	mapboxgl.accessToken = 'pk.eyJ1IjoidGhhYmlzb21hZ3dhemEiLCJhIjoiY2tqcjZqdW9pMWRoZjJ4bzh4bmsyeHk2byJ9.n--FyDHu_Iopa6D65i_7Qg';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/thabisomagwaza/ckjtfzm9i0b6s1ao07233c0nq',
		scrollZoom: false
	});
	
	// create bounds
	const bounds = new mapboxgl.LngLatBounds();
	
	locations.forEach(location => {
		// create element
		const el = document.createElement('div')
		el.className = 'marker'
	
		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom'
		})
		.setLngLat(location.coordinates)
		.addTo(map)
	
		bounds.extend(location.coordinates)
	
		new mapboxgl.Popup({offset: 30}).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);
	});
	
	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 100,
			left: 150,
			right: 150
		}
	})
}

