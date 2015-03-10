var App = {};

/**
 * Models
 */

App.Models = {};

App.Models.Movie = wp.api.models.Post.extend( {
	urlRoot: WP_API_Settings.root + '/movies',

	initialize: function() {
		this.syncMedia();
		this.on( 'change:featured_image', this.syncMedia );
	},

	syncMedia: function() {
		var featuredImageId = this.get( 'featured_image' );

		if ( ! featuredImageId ) {
			return;
		}

		new wp.api.models.Media( {
			ID: featuredImageId
		} ).fetch().done( function( media ) {
			this.set( 'poster', media );
		}.bind( this ) );
	}
} );

/**
 * Collections
 */

App.Collections = {};

App.Collections.Movies = wp.api.collections.Posts.extend( {
	url: WP_API_Settings.root + '/movies',

	model: App.Models.Movie
} );

/**
 * Views
 */

App.Views = {};

App.Views.App = Backbone.View.extend( {
	el: '#main',

	template: _.template( $( '#tmpl-app' ).html() ),

	navigate: function( view ) {
		if ( this.currentView ) {
			this.currentView.remove();
		}

		this.currentView = view;
		this.render();
	},

	render: function() {
		this.$el.html( this.template() );

		if ( this.currentView ) {
			this.$el.append( this.currentView.$el );
		}
	}
} );

App.Views.MovieList = Backbone.View.extend( {
	tagName: 'ul',

	className: 'movie-list',

	initialize: function() {
		this.listenTo( this.collection, 'sync', this.render );
	},

	render: function() {
		var markup = this.collection.map( function( movie ) {
			var listItem = new App.Views.MovieListItem( {
				model: movie
			} );

			return listItem.render().el;
		} );

		this.$el.html( markup );
		return this;
	}
} );

App.Views.MovieListItem = Backbone.View.extend( {
	tagName: 'li',

	className: 'movie-list-item',

	template: _.template( $( '#tmpl-list-item' ).html() ),

	initialize: function() {
		this.listenTo( this.model, 'change', this.render );
	},

	render: function() {
		var markup = this.template( this.model.toJSON() );
		this.$el.html( markup );
		return this;
	}
} );

/**
 * Routing
 */

App.Router = Backbone.Router.extend( {
	routes: {
		'': 'index',
		'movie/:movie': 'detail'
	},

	initialize: function( options ) {
		_.extend( this, options );
	},

	index: function() {
		var movies;

		if ( ! this.movieList ) {
			movies = new App.Collections.Movies();

			movies.fetch( {
				data: { posts_per_page: -1 },
			    processData: true
			} );

			this.movieList = new App.Views.MovieList( { collection: movies } );
		}

		this.movieList.render();
		this.appView.navigate( this.movieList );
	},

	detail: function( movie ) {
		console.log( 'Movie Detail' );
		this.appView.navigate( /* TODO */ );
	}
} );

/**
 * Initialization
 */

new App.Router( {
	appView: new App.Views.App()
} );
Backbone.history.start( { pushState: true } );

$( document ).on( 'click', 'a', function( e ) {
	e.preventDefault();
	Backbone.history.navigate( this.pathname, true );
});
