---
---
Router = React.createFactory(ReactRouter.Router)
Route = React.createFactory(ReactRouter.Route)
IndexRoute = React.createFactory(ReactRouter.IndexRoute)

window.contentDB = false

browserHistory = ReactRouter.browserHistory
Link = ReactRouter.Link

ReactGA.initialize('UA-75492019-1')

setTitle = (title) ->
  $('title').html(title)

window.htmlDecode = (encoded) ->
  $('<div/>').html(encoded).text()

parseData = (jQueryData) ->
  data = {}

  children = jQueryData.children()

  children.each (index, child) ->
    if child.childElementCount > 0
      data = addNode(data, child.nodeName, parseData($(child)))
    else
      data[child.nodeName] = child.innerHTML

  return data

addNode = (data, nodeName, value) ->
  if data[nodeName]
    if data[nodeName] instanceof Array
      data[nodeName].push value
    else
      data[nodeName] = [ value ].concat data[nodeName]
  else
    data[nodeName] = value

  return data

getData = (callback) ->
  if contentDB
    callback(contentDB)
  else
    $.ajax({
      url: '/content.xml'
      dataType: 'html'
      success: (data) ->
        jQueryData = $($.parseXML(data))
        parsedData = parseData(jQueryData)

        window.idx = lunr ->
          @field 'id'
          @field 'title', {boost: 10}
          @field 'content'

        window.contentDB = new SODB()

        for post in parsedData.site.posts.post
          contentDB.add(post)

        for page in parsedData.site.pages.page
          page.link = page.link + '.html' unless page.link == "/"
          contentDB.add(page)

        for category in parsedData.site.categories.category
          contentDB.add(category)

        for project in parsedData.site.projects.project
          contentDB.add(project)

        for entry in contentDB.all()
          entry.id = entry.___id
          idx.add(entry)

        callback(contentDB)
  })


MenuButton = React.createClass({
  displayName: 'MenuButton'

  render: ->
    React.createElement(
      'span'
      {className: 'hint--right', 'data-hint': @props.text}
      React.createElement(Link, {to: @props.href, className: "icon ion-#{@props.icon}"})
    )
})

Layout = React.createClass({
  displayName: 'Layout'

  contextTypes:
    router: ->
      return React.PropTypes.func.isRequired

  getInitialState: ->
    { search: false }

  componentDidMount: ->
    ReactGA.pageview(@props.location.pathname)

  componentWillReceiveProps: ->
    NProgress.start()

  componentDidUpdate: ->
    NProgress.done()
    ReactGA.pageview(@props.location.pathname)

  toggleSearch: ->
    if !(@state.search)
      ReactGA.event {
        category: 'User'
        action: 'Opened Search'
      }
    @setState({search: !(@state.search) })

  handleSearch: (e) ->
    e.preventDefault()

    searchTerm = $('#searchTerm').val()

    @context.router.push('/search/' + searchTerm)

  render: ->
    React.DOM.div {},
      if @state.search
        React.DOM.div {className: 'searchForm'},
          React.DOM.form {action: '', onSubmit: @handleSearch},
            React.DOM.input {type: 'text', placeholder: 'search', id: 'searchTerm'}
            React.DOM.input {type: 'submit', value: 'Search!', onClick: @handleSearch}

      React.DOM.div {className: 'menu'},
        React.createElement(
          Link
          { to: '/' }
          React.DOM.img { src: '/img/me.jpg' }
        )
        React.DOM.div { className: 'nav' },
          React.createElement(MenuButton, {text: 'Home', icon: 'ios-home', href: '/'})
          React.createElement(MenuButton, {text: 'Blog', icon: 'android-create', href: '/blog.html'})
          React.createElement(MenuButton, {text: 'Categories', icon: 'ios-bookmarks-outline', href: '/category.html'})
          React.createElement(MenuButton, {text: 'Code & Projects', icon: 'code-working', href: '/code.html'})
          React.createElement(MenuButton, {text: 'CV', icon: 'document-text', href: '/cv.html'})
          React.DOM.span {className: 'hint--right', 'data-hint': 'Search'},
            React.DOM.a {href: '#', className: 'icon ion-ios-search', onClick: @toggleSearch}
          React.DOM.span {className: 'hint--right', 'data-hint': 'Twitter'},
            React.DOM.a {href: 'https://twitter.com/ArcathWhitefall', className: 'icon ion-social-twitter'}
          React.DOM.span {className: 'hint--right', 'data-hint': 'Github'},
            React.DOM.a {href: 'https://github.com/Arcath', className: 'icon ion-social-github'}

      React.DOM.div { className: 'content', id: 'content'}, @props.children
})

Static = React.createClass({
  displayName: 'Static'

  render: ->
    page = @props.content.findOne({link: @props.location.pathname})
    setTitle(page.title)

    if page.markdown
      content = Marked(page.content)
    else
      content = htmlDecode(page.content)

    React.DOM.div {},
      React.DOM.div {dangerouslySetInnerHTML: {__html: content}}
})

NotFound = React.createClass({
  displayName: 'NotFound'

  componentDidMount: ->
    setTitle('Error 404')

  render: ->
    React.createElement(
      Layout
      {}
      React.createElement('h1', {}, 'Page not Found')
    )
})

Blog = React.createClass({
  displayName: 'Blog'

  blogYears: ->
    posts = @props.content.where({type: 'post'})
    years = []
    for post in posts
      if years.indexOf(post.year) == -1
        years.push post.year

    return years

  months: (year) ->
    posts = @props.content.where({type: 'post'}, {year: year})
    months = []
    for post in posts
      if months.indexOf(post.month) == -1
        months.push post.month

    return months

  componentDidMount: ->
    setTitle('Blog')

  postsInYear: (year) ->
    @props.content.order({type: 'post'}, {year: year}, 'sortDate').reverse()

  postsInMonth: (year, month) ->
    @props.content.order({type: 'post'}, {year: year}, {month: month}, 'sortDate').reverse()

  render: ->
    React.DOM.div {},
      React.DOM.h1 {}, 'Blog'
      for year in @blogYears()
        React.DOM.div {key: year},
          React.DOM.h2 {}, year

          if @postsInYear(year).length <= 9
            for post in @postsInYear(year)
              React.createElement(PostDetails, {key: post.___id, post: post})

          else
            for month in @months(year)
              React.DOM.div {key: month},
                React.DOM.h3 {}, month

                for post in @postsInMonth(year, month)
                  React.createElement(PostDetails, {key: post.___id, post: post})
})

PostDetails = React.createClass({
  displayName: 'PostDetails'

  render: ->
    React.DOM.div {className: 'post'},
      React.DOM.h3 {}, React.createElement(Link, {to: @props.post.link}, @props.post.title)
      React.DOM.div {dangerouslySetInnerHTML: {__html: htmlDecode(@props.post.excerpt)}}
      if @props.post.type == 'post'
        React.DOM.div {className: 'details'},
          React.DOM.i {className: 'icon ion-ios-bookmarks-outline'}
          " "
          @props.post.category
          " "
          React.DOM.i {className: 'icon ion-ios-calendar-outline'}
          " "
          @props.post.date
})

Categories = React.createClass({
  displayName: 'Categories'

  render: ->
    setTitle('Categories')

    React.DOM.div {},
      React.DOM.h1 {}, 'Categories'
      React.DOM.ul {},
        for category in @props.content.where({type: 'category'})
          React.DOM.li {key: category.name},
            React.createElement(Link, {to: category.link}, category.name)
})

Category = React.createClass({
  displayName: 'Category'

  render: ->
    category = @props.content.findOne({type: 'category'}, {name: @props.routeParams.name})

    React.DOM.div {},
      unless category
        React.createElement(NotFound, {})
      else
        category.posts.post = [].concat(category.posts.post)
        setTitle(category.name)

        React.DOM.div {},
          React.DOM.h1 {}, category.name
          React.DOM.div {},
            for postData in category.posts.post
              post = @props.content.findOne({link: postData.link})
              React.createElement(PostDetails, {post: post, key: post.___id})
})

Post = React.createClass({
  displayName: 'Post'

  render: ->
    post = @props.content.findOne({link: @props.location.pathname})

    React.DOM.div {},
      unless post
        React.createElement(NotFound, {})
      else
        setTitle(post.title)

        React.DOM.div {},
          React.DOM.h1 {}, post.title
          React.DOM.div {},
            React.DOM.i {}, post.date
            React.DOM.br {}
            React.DOM.b {}, post.categories
          React.DOM.div {dangerouslySetInnerHTML: {__html: htmlDecode(post.content)}}
          React.DOM.div {},
            React.createElement(
              ReactDisqusThread
              {
                shortname: 'arcathsblog'
                identifier: window.location.href
                title: post.title
                url: window.location.href
              }
            )

})

Search = React.createClass({
  displayName: 'Search'

  render: ->
    React.DOM.div {},
      React.DOM.div {},
        React.DOM.h1 {}, 'Search Results'
        for result in idx.search(@props.routeParams.term)
          post = contentDB.findOne({___id: result.ref})
          React.createElement(PostDetails, {key: result.ref, post: post})

})

Code = React.createClass({
  displayName: 'Code'
  componentDidMount: ->
    setTitle('Code & Projects')

  render: ->
    React.DOM.div {},
      React.DOM.h1 {}, 'Code & Projects'
      React.DOM.p {},
        "Whilst most of my code is "
        React.DOM.i {}, "closed source"
        " and not avliable to the public all of the libraries I have written are."
      React.DOM.p {},
        "My "
        React.DOM.a {href: "https://github.com/Arcath"}, "Github"
        " has a pretty complete record of my public work since 2009"

      for project in @props.content.order({type: 'project'}, 'title')
        React.createElement(Project, {key: project.___id, project: project})
})

Project = React.createClass({
  displayName: 'Project'

  getInitialState: ->
    {latestRelease: 'v0.0.0'}

  componentDidMount: ->
    _ = @
    Github.repo(@props.project.github).releases (err, releases) ->
      _.setState({latestRelease: releases[0].tag_name})

  render: ->
    React.DOM.div {className: 'project'},
      React.DOM.b {}, @props.project.title
      React.DOM.span {}, " (#{@state.latestRelease}) "
      React.DOM.a {href: "https://github.com/" + @props.project.github}, 'Source '

      if @props.project.atom != ""
        React.DOM.a {href: @props.project.atom}, "Atom "

      if @props.project.npm != ""
        React.DOM.a {href: @props.project.npm}, "NPM "

      React.DOM.hr {}
      React.DOM.div {dangerouslySetInnerHTML: {__html: htmlDecode(@props.project.content)}}
})

Loading = React.createClass({
  displayName: 'Loading'

  componentDidMount: ->
    setTitle('Loading')

  render: ->
    React.createElement(
      'div'
      {className: 'loader'}
      React.createElement('h1', {}, 'Loading')
      React.createElement('img', {src: '/img/me.jpg'})
      React.createElement(
        'div'
        {className: 'spinner'}
        React.createElement('div', {className: 'spinner-icon'})
      )
    )
})

Loader = React.createClass({
  displayName: 'Loader'

  getInitialState: ->
    { loaded: false }

  componentDidMount: ->
    _ = @
    getData((content) ->
      _.setState({ loaded: true, content: content })
    )

  render: ->
    React.DOM.div {},
      if @state.loaded
        React.createElement(@props.route.params.component, {content: @state.content, location: @props.location, routeParams: @props.routeParams})
      else
        React.createElement(Loading, {})
})

ArcathNetRouter = (
  Router(
    {history: browserHistory}
    Route(
      {name: 'Layout', path: '/', component: Layout}
        IndexRoute({name: 'index', component: Loader, params: {component: Static}})
        Route({name: 'Blog', path: 'blog.html', component: Loader, params: {component: Blog}})
        Route({name: 'Categories', path: 'category.html', component: Loader, params: {component: Categories}})
        Route({name: 'Category', path: 'category/:name', component: Loader, params: {component: Category}})
        Route({name: 'CV', path: 'cv.html', component: Loader, params: {component: Static}})
        Route({name: 'Code', path: 'code.html', component: Loader, params: {component: Code}})

        Route({name: 'Post', path: ':year/:month/:day/:title.html', component: Loader, params: {component: Post}})
        Route({name: 'Search', path: 'search/:term', component: Loader, params: {component: Search}})
    )

    Route({name: 'NotFound', path: '*', component: NotFound})
  )
)

ReactDOM.render(ArcathNetRouter, document.getElementById('body'))
