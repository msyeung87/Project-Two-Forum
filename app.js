var express = require('express');
var app = express();
var ejs = require('ejs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('forum.db');
var request = require('request');
var bodyParser = require('body-parser');
var urlencodedBodyParser = bodyParser.urlencoded({extended: false});
app.use(urlencodedBodyParser);
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view_engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.listen(3000, function(){
	console.log("Forum is up and running");
});

app.get('/', function(req, res){
	db.all("SELECT * FROM subforums", function(err, rows){
		res.render('mainpage.ejs', {rows: rows});
	});
});

app.get('/forums/threads/:id', function(req, res){
	var id = req.params.id;
	db.all("SELECT topics, id FROM subforums", function(err, rows){
		var subforumTable = rows;
		db.all("SELECT threads.id AS thread_id, * FROM threads INNER JOIN subforums ON threads.subforum_id = subforums.id WHERE subforum_id=? ORDER BY likes DESC", id, function(err, rows){
			res.render('mainthreads.ejs', {id: id, topics: rows, children: subforumTable})
		});
	})
});

app.get('/forums/threads/:id/new', function(req, res){
	var id = req.params.id;
	db.all("SELECT topics, id FROM subforums", function(err, rows){
	var subforumTable = rows;
		db.all("SELECT * FROM threads WHERE id=?", id, function(err, rows){
			res.render('createthreads.ejs', {id: id, children: subforumTable});
		});
	});
});

//Creating a new thread/user/posts
app.post('/forums/threads/:id', function(req, res){
	var id = req.params.id;
	var title = req.body.threadTitle;
	var post = req.body.postComments;
	var username = req.body.userName;
	// Creating a new thread
	if(username === "" || title === "" || post === ""){
		console.log("no stuff entered");
	} else {
		// Adding title
		db.run("INSERT INTO threads (subforum_id, title, likes, counter) VALUES (?,?,0,1)", id, title, function(err, rows){
			// Getting the new thread id and counter
			db.get("SELECT id, counter FROM threads WHERE title=?", title, function(err, row){
				var threadID = row.id;
				var postcount = row.counter;
				// Getting geo-location 
				request.get('http://ipinfo.io/json', function(err, response, body){
					var parsedBody = JSON.parse(body);
					var city = parsedBody.city;
					var region = parsedBody.region;
					var image = "http://www.mariowiki.com/images/thumb/2/2d/WiiU_NewMarioU_2_char01_E3.png/180px-WiiU_NewMarioU_2_char01_E3.png";
						// Adding a new user
						db.run("INSERT INTO users (name, city, region, img) VALUES (?,?,?,?)", username, city, region, image, function(err, rows){
							//Getting the new user's ID
							db.get("SELECT id FROM users WHERE name=?", username, function(err, row){
							var userid = row.id;
								// Add a new post and setting the new user's ID and thread ID to the post
								db.run("INSERT INTO comments (user_id, threads_id, comment) VALUES (?,?,?)", userid, threadID, post, function(err, rows){
									postcount ++;
									// Updating the num of comments
									db.run("UPDATE threads SET counter=? WHERE id=?", postcount, id, function(err, rows){
									res.redirect('/forums/threads/'+ id)
								});
							});
						});
					});
				})
			});
		});
	}
});

//Showing posts/comments
app.get('/forums/threads/:id/show', function(req, res){
	var id = req.params.id;
	db.all("SELECT topics, id FROM subforums", function(err, rows){
	var subforumTable = rows;
		// Joining two tables of Comments and user's ID
		db.all("SELECT * FROM comments INNER JOIN users ON users.id = comments.user_id WHERE threads_id=?", id, function(err, rows){
				var othertable = rows
			// Getting info, likes from threads table
			db.all("SELECT likes FROM threads WHERE id=?", id, function(err, rows){
				res.render('showposts.ejs', {id: id, othertable:othertable, rows:rows, children: subforumTable})
			});
		});
	})
});

// Creating new posts within a thread
app.post('/forums/threads/:id/shownew', function(req, res){
	var id = req.params.id;
	var username = req.body.userName;
	var posts = req.body.postComments;
	if(username === "" || posts === "" ){
		console.log("Enter name");
	} else {
		// Getting user geo-location
		request.get('http://ipinfo.io/json', function(err, response, body){
		var parsedBody = JSON.parse(body);
		var city = parsedBody.city;
		var region = parsedBody.region;
		var image = "http://www.mariowiki.com/images/thumb/2/2d/WiiU_NewMarioU_2_char01_E3.png/180px-WiiU_NewMarioU_2_char01_E3.png";
		// Creating a new user
			db.run("INSERT INTO users (name, city, region, img) VALUES (?,?,?,?)", username, city, region, image, function(err, rows){
				// Getting the new user's id
				db.get("SELECT id FROM users WHERE name=?", username, function(err, row){
				var userid = row.id;
					db.get("SELECT counter FROM threads WHERE id=?", id, function(err, row){
					var postcount = row.counter;
						// Creating a new post and inserting user id and thread id
						db.run("INSERT INTO comments (user_id, threads_id, comment) VALUES (?,?,?)", userid, id, posts, function(err, rows){
							postcount ++;
							// Updating num of comments within the thread
							db.run("UPDATE threads SET counter=? WHERE id=?", postcount, id, function(err, rows){
							res.redirect('/forums/threads/'+ id +'/show');
							});
						});
					});
				});
			});
		});
	}
});

// Adding likes to thread's popularity
app.put('/forums/threads/:id/shownew', function(req, res){
	var votes = parseInt(req.body.likevote);
	var upvote = votes + 1;
	var id = req.params.id;
	// Updating the likes of the thread
	db.run("UPDATE threads SET likes=? WHERE id=?", upvote, id, function(error, rows){
    	res.redirect('/forums/threads/'+ id +'/show');
    });
});

// Deleting likes to thread's popularity and auto delete thread when it gets to -5 vote
app.put('/forums/threads/:id/showvote', function(req, res){
	var currentVote = req.body.current_vote;
	var downvote = currentVote -1;
	var id = req.params.id;
	// Updating the likes of the thread
	db.run("UPDATE threads SET likes=? WHERE id=?", downvote, id, function(error, rows){
    	if(currentVote === "-10"){
    		db.run("DELETE FROM threads WHERE id=?", id, function(err, rows){
    		res.redirect('/');	
    		});
    	} else {
    		res.redirect('/forums/threads/'+ id +'/show');	
    	}
    });
});

// Getting contact form
app.get('/contact/new', function(req, res){
	db.all("SELECT topics, id FROM subforums", function(err, rows){
	var subforumTable = rows;
		res.render('contactpage.ejs', {children: subforumTable});
	});
});

// Getting user's contact and comments
app.post('/contact', function(req, res){
	var username = req.body.userName;
	var email = req.body.email;
	var comments = req.body.postComments;
	db.all("SELECT topics, id FROM subforums", function(err, rows){
	var subforumTable = rows;
		db.run("INSERT INTO contacts (name, email, comment) VALUES (?,?,?)", username, email, comments, function(err, rows){
			res.render('thankyou.ejs', {children: subforumTable});
		});
	});
});

// Getting user's image profile
app.get('/contact/image/:id', function(req, res){
	var id = req.params.id;
	db.all("SELECT topics, id FROM subforums", function(err, rows){
	var subforumTable = rows;
		db.all("SELECT name, img FROM users WHERE id=?", id, function(err, rows){
		res.render('updateimage.ejs', {id: id, children: subforumTable});
		});
	});
});

// Updating user's image profile
app.post('/contact/image/:id/new', function(req, res){
	var id = req.params.id;
	var image = req.body.profileImage;
	db.run("UPDATE users SET img=? WHERE id=?", image, id, function(err, rows){
		res.redirect('/');
	});
});



