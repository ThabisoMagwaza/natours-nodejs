/* eslint-diasble */
import {login,logout} from './login'
import {drawMap} from './mapbox'
import {showAlert, hideAlert,flashAlert} from './alert'
import {updateSettings} from './settings'

const formLogin = document.querySelector('#form-login');
const map = document.querySelector('#map')
const logoutBtn = document.querySelector('.nav__el--logout')
const formUserData = document.querySelector('#form-user-data')
const formPassword = document.querySelector('#form-password-settings')

if(map) drawMap(JSON.parse(map.dataset.locations))

if(formLogin) {
	formLogin.addEventListener('submit', async event => {
		event.preventDefault();

		const email = document.querySelector('#email').value;
		const password = document.querySelector('#password').value;

		const loginResult = await login(email, password);
		
		if(loginResult.isLoggedIn){
			showAlert('success', 'Logged in successfully!')
			setTimeout(() =>{
				hideAlert();
				window.location.assign('/');
			}, 2000);
		}else{
			showAlert('error', `Error Loggin in: ${loginResult.message}`)
			setTimeout(() => {
				hideAlert()
			}, 3000);
		}
	});
}

if(logoutBtn) {
	logoutBtn.addEventListener('click',async () => {
		const res = await logout();
		if(res.isLoggedOut){
			showAlert('success', 'Logged out successfully!')
			setTimeout(() =>{
				hideAlert();
				window.location.assign('/');
			}, 2000);
		}else{
			showAlert('error', `Error Loggin out: ${loginResult.message}`)
			setTimeout(() => {
				hideAlert()
			}, 3000);
		}
	})
}

if(formUserData) {
	formUserData.addEventListener('submit',async e => {
		e.preventDefault();
		const form = new FormData();
		form.append('name',document.querySelector('#name').value)
		form.append('email',document.querySelector('#email').value)
		form.append('photo',document.querySelector('#photo').files[0])

		const res = await updateSettings('user-data',form);

		res.success ? flashAlert('success','Updated successfully', {action: 'reload'}, 2000) 
			: flashAlert('error', `Error Updating: ${res.message}`, {action: 'reload'},2000 )
	})
} 

if(formPassword) {
	formPassword.addEventListener('submit',async e => {
		e.preventDefault();
		const btnSave = document.querySelector('#btn-save-password');
		btnSave.textContent = 'Updating...'

		const currentPassword = document.querySelector('#password-current').value;
		const newPassword = document.querySelector('#password').value;
		const passwordConfirm = document.querySelector('#password-confirm').value;

		const res = await updateSettings('password',{currentPassword,newPassword,passwordConfirm});

		btnSave.textContent = 'Save password'
		res.success ? flashAlert('success','Updated successfully', {action: 'reload'}, 2000) 
			: flashAlert('error', `Error Updating: ${res.message}`, {action: ''},3000 )
	})
} 