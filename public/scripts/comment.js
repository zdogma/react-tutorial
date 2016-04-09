var CommentList = React.createClass({
  render: function() {
    var CommentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author_name={comment.author_name}>
          {comment.body_text}
        </Comment>
      );
    });
    return (
      <div className='commentList'>
        {CommentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author_name = ReactDOM.findDOMNode(this.refs.author_name).value.trim();
    var body_text   = ReactDOM.findDOMNode(this.refs.body_text).value.trim();
    if(!body_text || !author_name) {
      return;
    }

    this.props.onCommentSubmit({author_name: author_name, body_text: body_text});
    ReactDOM.findDOMNode(this.refs.author_name).value = '';
    ReactDOM.findDOMNode(this.refs.body_text).value = '';
    return;
  },
  render: function() {
    return (
      <form className='commentForm' onSubmit={this.handleSubmit}>
        <input type='text' placeholder='your name' ref='author_name' />
        <input type='text' placeholder='Say something...!' ref ='body_text' />
        <input type='submit' value='送信' />
      </form>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, error) {
        console.error(this.props.url, status, error.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    // 先に新しいコメントも足して表示させ、後からコールバックで取得したdataで置き換える
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, error) {
        console.error(this.props.url, status, error.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className='commentBox'>
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className='comment'>
        <h3 className='commentAuthor'>
          {this.props.author_name}
        </h3>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

ReactDOM.render(
  <CommentBox url='/api/comments' pollInterval={2000} />,
  document.getElementById('content')
);
