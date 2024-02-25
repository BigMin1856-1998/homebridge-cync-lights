import { HomebridgePluginUiServer } from '@homebridge/plugin-ui-utils';
import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';

class PluginUiServer extends HomebridgePluginUiServer {

  constructor () {
    // super must be called first
    super();
    this.onRequest('/requestCode', this.handleRequestCode.bind(this));
    this.onRequest('/login', this.handleLogin.bind(this));
    this.ready();
  }

  async handleRequestCode(payload) {
    const request = {
      corp_id: '1007d2ad150c4000',
      email: payload.emailAddress,
      local_lang: 'en-us',
    };
    await fetch('https://api.gelighting.com/v2/two_factor/email/verifycode', {
      method: 'post',
      body: JSON.stringify(request),
      headers: {'Content-Type': 'application/json'},
    });
  }

  async handleLogin(payload) {
    const request = {
      corp_id: '1007d2ad150c4000',
      email: payload.emailAddress,
      password: payload.password,
      two_factor: payload.mfaCode,
      resource: 'abcdefghijk',
    };
    const response = await fetch('https://api.gelighting.com/v2/user_auth/two_factor', {
      method: 'post',
      body: JSON.stringify(request),
      headers: {'Content-Type': 'application/json'},
    });

    const data = await response.json();
    if (data.error) {
      return {
        error: 'Login failed.  Please check your password and 2FA code.',
      };
    } else {
      fs.writeFileSync(path.join(this.homebridgeStoragePath, 'cync.json'), JSON.stringify(data), 'utf-8');
      return {
        platform: 'CyncLights',
        name: 'Cync Lights',
        emailAddress: payload.emailAddress,
      };
    }
  }

}

// start the instance of the class
(() => {
  return new PluginUiServer;
})();