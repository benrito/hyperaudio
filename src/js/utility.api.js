/* api
 *
 */

var api = (function(hyperaudio) {

	return {
		init: function(options) {
			this.options = hyperaudio.extend({
				api: 'http://data.hyperaud.io/',
				transcripts: 'transcripts/',
				mixes: 'mixes/',
				whoami: 'whoami/'
			}, options);

			// API State
			this.error = false;

			// User Properties
			this.guest = false; // False to force 1st call
			this.username = ''; // Falsey to force 1st call

			// Stored requested data
			this.transcripts = null;
			this.transcript = null;
			this.mixes = null;
			this.mix = null;
		},
		callback: function(callback, success) {
			if(typeof callback === 'function') {
				callback.call(this, success);
			}
		},
		getUsername: function(callback, force) {
			var self = this;

			// force = typeof force === 'undefined' ? true : force; // default force = true.

			if(!force && (this.guest || this.username)) {
				setTimeout(function() {
					self.callback(callback, true);
				}, 0);
			} else {
				xhr({
					url: this.options.api + this.options.whoami,
					complete: function(event) {
						var json = JSON.parse(this.responseText);
						self.guest = !json.user;
						if(!self.guest) {
							self.username = json.user.username;
						} else {
							self.username = '';
						}
						self.callback(callback, true);
					},
					error: function(event) {
						self.error = true;
						self.callback(callback, false);
					}
				});
			}
		},
		getTranscripts: function(callback, force) {
			var self = this;
			if(!force && this.transcripts) {
				setTimeout(function() {
					self.callback(callback, true);
				}, 0);
			} else {
				xhr({
					url: this.options.api + this.options.transcripts,
					complete: function(event) {
						var json = JSON.parse(this.responseText);
						self.transcripts = json;
						self.callback(callback, true);
					},
					error: function(event) {
						self.error = true;
						self.callback(callback, false);
					}
				});
			}
		},
		getTranscript: function(id, callback, force) {
			var self = this;
			if(!force && this.transcript && this.transcript._id === id) {
				setTimeout(function() {
					self.callback(callback, true);
				}, 0);
			} else {
				this.getUsername(function(success) {
					if(success && id) {
						xhr({
							url: self.options.api + (self.guest ? '' : self.username + '/') + self.options.transcripts + id,
							complete: function(event) {
								var json = JSON.parse(this.responseText);
								self.transcript = json;
								self.callback(callback, true);
							},
							error: function(event) {
								self.error = true;
								self.callback(callback, false);
							}
						});
					} else {
						self.error = true; // Setting the common error prop is redundant, since it would have been set in getUsername failure.
						self.callback(callback, false);
					}
				});
			}
		},
		getMixes: function(callback, force) {
			var self = this;
			if(!force && this.mixes) {
				setTimeout(function() {
					self.callback(callback, true);
				}, 0);
			} else {
				this.getUsername(function(success) {
					if(success) {
						xhr({
							url: self.options.api + (self.guest ? '' : self.username + '/') + self.options.mixes,
							complete: function(event) {
								var json = JSON.parse(this.responseText);
								self.mixes = json;
								self.callback(callback, true);
							},
							error: function(event) {
								self.error = true;
								self.callback(callback, false);
							}
						});
					} else {
						self.error = true; // Setting the common error prop is redundant, since it would have been set in getUsername failure.
						self.callback(callback, false);
					}
				});
			}
		},
		getMix: function(id, callback, force) {
			var self = this;
			if(!force && this.mix && this.mix._id === id) {
				setTimeout(function() {
					self.callback(callback, true);
				}, 0);
			} else {
				this.getUsername(function(success) {
					if(success && id) {
						xhr({
							url: this.options.api + (this.guest ? '' : this.username + '/') + this.options.mixes + id,
							complete: function(event) {
								var json = JSON.parse(this.responseText);
								self.mix = json;
								self.callback(callback, true);
							},
							error: function(event) {
								self.error = true;
								self.callback(callback, false);
							}
						});
					} else {
						self.error = true; // Setting the common error prop is redundant, since it would have been set in getUsername failure.
						self.callback(callback, false);
					}
				});
			}
		},
		putMix: function(mix, callback) {
			var self = this;

			// Are we storing the current Mix we're editing in here?
			// Yes, but only refreshing the mix data here on Load and Save.
			// The current mix data will be in the stage's HTML.

			if(typeof mix === 'object') {
				var type = 'POST',
					id = '';

				this.getUsername(function(success) {

					if(success && !this.guest && this.username) {

						// Check: Mix IDs match and user is owner.

						if(this.mix && this.mix._id && this.mix._id === mix._id && this.username === mix.owner) {
							type = 'PUT';
							id = this.mix._id;
							// Check some stuff?
						} else {
							// Check some stuff?
						}

						xhr({
							url: self.options.api + self.username + '/' + self.options.mixes + id,
							type: type,
							data: JSON.stringify(mix),
							complete: function(event) {
								var json = JSON.parse(this.responseText);
								self.mix = json;
								self.callback(callback, true);
							},
							error: function(event) {
								self.error = true;
								self.callback(callback, false);
							}
						});
					} else {
						self.callback(callback, false);
					}
				}, true); // Force the call to get username before attempting to save.
			} else {
				setTimeout(function() {
					self.callback(callback, false);
				}, 0);
			}
		}
	};

}(hyperaudio));
