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
		$( '#main' ).html( this.$el );
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


/**
 * Initialization
 */

var movies, movieList;

movies = new App.Collections.Movies();
movieList = new App.Views.MovieList( { collection: movies } );

movieList.render();
movies.fetch();
