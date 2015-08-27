// IMPORTANT DO NOT FORGET
//1.DATABASE FLAG NEEDS TO BE SET TO ZERO AT THE TIME OF LOGIN FOR USER OR MAKE IT AS DEFAULT 0
/////////////////////////////////////////////////////////////////////////////////////////////

var app = require('express')();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var express = require('express');

var mysql=require('mysql');

var notification_number=0;


//not sure at the moment how to fetch this value from zend//
//var user_id=31;

var connection =  mysql.createConnection({
  	host : 'localhost',
  	user : '',
  	password: '',
  	database:''
 });
 
connection.connect(function(err){
	 
	 if(!err){
	 	 console.log('successfully connected to database');	
	 }
	 
	 else{
	 	 console.log('to err is human');	
	 }
	 	
	
});


app.use(express.static(__dirname+'/public'));

io.on('connection', function(socket){
  //console.log(__dirname);
  
  socket.on('user_id',function(msg){
		 console.log('userid: '+msg);
		 user_id=parseInt(msg);
  });
  
   
  /*socket.on('chat message',function(msg){
  	
  		 console.log('message: '+msg);
  		 
       
       splt=msg.split("-");
       answered_question_answer=splt[0];
       answered_question_id=splt[1];

       //update the database here

       var insert_table_bot_answers={
        
        answer:answered_question_answer,
        bot_questions_id:answered_question_id,
        user_id:user_id

       };

       connection.query("insert into bot_answers set ?",insert_table_bot_answers,function(err){

         if(err){
          console.log('error in inserting data in bot_answers');
         }


       });

       //updating user table entry here (that particular entry for which this question was asked)

       var update_category;

       connection.query("select category from bot_profile_questions where bot_profile_questions_id="+answered_question_id,function(err,rows,fields){

         if(err){
          console.log('error in getting question category');
         }

         else{
          //console.log(rows);
          update_category=rows[0].category;
          //console.log(update_category);
          var update_query='update user set '+update_category+' ='+connection.escape(answered_question_answer)+' where user_id='+user_id;

          console.log(update_query);


          connection.query(update_query,function(err,rows){

          if(err){
           //console.log("update user set "+update_category+"='"+answered_question_answer+"' where user_id="+user_id);
           console.log('error in updating user table');
          }

          });
         }

       });

       
  		 	
  		 });*/
  		 
   socket.on('body loaded',function(msg){
   
		notification_number=0;
  	 	
  	 	console.log('now is the time to send the first message');
  	 	
  	 	//var sql=;
  	 	
  	 	connection.query("select flag from user where user_id="+user_id,function(err,rows,fields){
  	 	
  	 		 if(err){
  	 		 	console.log('to err is human in sql query get message');	
  	 		 }
  	 		 
  	 		 else{
  	 		 	var test=rows[0]['flag'];
  	 		 	if(test == 1){
  	 		 		
  	 		 		//this user has already filled all the fields in his profile
  	 		 		//this will be handled later//
  	 		 		
  	 		 		console.log('all fields in profile are filled');
  	 		 		
  	 		 	}
  	 		 	
  	 		 	else if(test==0){
  	 		 		console.log("all fileds in profile are not filled");  	
  	 		 		
  	 		 		//action starts 

  	 		 		connection.query('select phone,degree,college,company,designation from user where user_id='+user_id,function(err,rows,fields){

  	 		 			if(err){
  	 		 				console.log('error in mysql query');
  	 		 			}

  	 		 			else{
  	 		 				console.log(rows);
  	 		 			}

  	 		 			//profile bot questions start here 

  	 		 			connection.query("select bot_profile_questions_id,category,question from bot_profile_questions order by sequence",function(e,rows1){

  	 		 				//console.log(rows1);

  	 		 				var sendques=[];

  	 		 				for(var i=0;i<rows1.length;i++){

  	 		 					if(rows[0][rows1[i].category]==null || rows[0][rows1[i].category]==''){

  	 		 						console.log('hello'+rows1[i].question);

  	 		 						//explicitly check for photo field as it is not included in user_table
                    if(rows1[i].category=='photo'){
                    	
                    	connection.query("select count(*) as c from user_picture where user_id="+user_id,function(err,r){
                      	  
                      	  if(err){
                      		  connection.log('error in photo query');
                      	  }
                      	  
                      	  else{
                      		  if(r[0].c<=0){
                      			  
                      			  console.log('yes yes yes '+r.c);
                      			  //io.emit('photo-upload',rows1[i].question+'-'+rows1[i].bot_questions_id);
                                  notification_number++; 
                      			  
                      		  }                    		  
                      	  }
                      	  
                        });
  					

                    }

  	 		 						//emit the question here as field is null and wait for response and then update
                    else{
                    	            console.log('here I am');
									notification_number++;
  	 		 						//sendques.push(rows1[i].question+'-'+rows1[i].bot_profile_questions_id); 
									}

  	 		 						

  	 		 					}

  	 		 				}
  	 		 		
  	 //-------------------------------------------------------------------------------------------------------------------//
  	 		 				
  	 ///now check for general questions that have not been answered --> basically do a join query then select unanswered questions ordered by date desc///
  	 		 		connection.query("select bot_questions_id,question from bot_questions where type='general' order by date_created desc",function(err,rows2){
  	 		 			
  	 		 			if(err){
  	 		 				console.log('error in general question query');
  	 		 			}
  	 		 			
  	 		 			else{
  	 		 				console.log(rows2);
  	 		 				
  	 		 				connection.query("select distinct b.bot_questions_id from bot_questions b inner join bot_answers a on b.bot_questions_id=a.bot_questions_id where b.type='general' and a.user_id="+user_id,function(err,rows3){
  	 		 					
  	 		 					
  	 		 				 if(err){
  	 		 					 console.log('error in join query');
  	 		 				 }
  	 		 				 
  	 		 				 else{
  	 		 					 console.log(rows3);
  	 		 					 
  	 		 					 var cnt=0;
  	 		 					 
  	 		 					 //rows3 contains all the questions that have been answered
  	 		 					 
  	 		 					 //console.log('again printing to check '+rows2);  	 		 					 
  	 		 					 
  	 		 					 //checking for question_id which are unanswered
  	 		 					 for(var i=0;i<rows2.length;i++){
  	 		 						 var j;
  	 		 						 for(j=0;j<rows3.length;j++){
  	 		 							 if(rows3[j].bot_questions_id==rows2[i].bot_questions_id) break;
  	 		 						 }
  	 		 						 
  	 		 						 if(j==rows3.length){
  	 		 							 //that means this question is unanswered
  	 		 							 cnt++;
  	 		 							 console.log('unanswered '+rows2[i].bot_questions_id);
										 notification_number++;
  	 		 							 //io.emit('general-question',rows2[i].question+'-'+rows2[i].bot_questions_id);
  	 		 						 }
  	 		 						 if(cnt==2) {
  	 		 							 //we need to display only 2 general questions
  	 		 							 break;
  	 		 						 }
  	 		 					 }
  	 		 					 
  	 		 					connection.query("select count(*) as c from project_user where user_id="+user_id,function(err,rows4){
  	 		  	 		 			
  	 		  	 		 			if(err){
  	 		  	 		 				console.log('error in hackathon query');
  	 		  	 		 			}
  	 		  	 		 			
  	 		  	 		 			else{
  	 		  	 		 				console.log(rows4);
  	 		  	 		 				if(rows4[0].c>=1){
  	 		  	 		 					//means that user has attended atleast one hackathon 
  	 		  	 		 					//we can ask him hackathon related questions
  	 		  	 		 					connection.query("select bot_questions_id,question from bot_questions where type='hackathon' order by date_created desc",function(err,rows5){
  	 		  	 		 						
  	 		  	 		 						if(err){
  	 		  	 		 							console.log('error in hackathon query from question table');
  	 		  	 		 						}
  	 		  	 		 						else{
  	 		  	 		 							console.log(rows5);
  	 		  	 		 							connection.query("select distinct b.bot_questions_id from bot_questions b inner join bot_answers a on b.bot_questions_id=a.bot_questions_id where b.type='hackathon' and a.user_id="+user_id,function(err,rows6){
  	 		  	 		 								
  	 		  	 		 								if(err){
  	 		  	 		 									console.log('error in hackathon join query');
  	 		  	 		 								}
  	 		  	 		 								
  	 		  	 		 								else{
  	 		  	 		 									
  	 		  	 		 									var cnt2=0; 
  	 		  	 		 									
  	 		  	 		 									console.log(rows6);
  	 		  	 		 									
  	 		  	 		 									for(var i=0;i<rows5.length;i++){
  	 		  	 		 										var j;
  	 		  	 		 										for(var j=0;j<rows6.length;j++){
  	 		  	 		 											if(rows5[i].bot_questions_id==rows6[j].bot_questions_id) break;
  	 		  	 		 										}
  	 		  	 		 										
  	 		  	 		 										if(j==rows6.length){
  	 		  	 		 											cnt2++;
  	 		  	 		 											console.log('unanswered questions in hackathon category '+rows5[i].question);
  	 		  	 		 											notification_number++;
																	//io.emit('general-question',rows5[i].question+'-'+rows5[i].bot_questions_id);
  	 		  	 		 										}
  	 		  	 		 										if(cnt2==2){
  	 		  	 		 											//we need only 2 questions
  	 		  	 		 											break;
  	 		  	 		 										}
  	 		  	 		 									}
  	 		  	 		 									
  	 		  	 		 										  	 		 									
  	 		  	 		 									  	 		  	 		 									
  	 		  	 		 									
  	 		  	 		 								}
  	 		  	 		 							
  	 		  	 		 								
  	 		  	 		 							
  	 		  	 		 							});
  	 		  	 		 						}
  	 		  	 		 						
  	 		  	 		 						
  	 		  	 		 					});
  	 		  	 		 				}
  	 		  	 		 				
  	 		  	 		 				connection.query("select question,date_created from bot_questions where type='blog' order by date_created desc",function(err,rows7){
		 										
		 										if(err){
		 											console.log('blog query error');
		 										}
		 										
		 										else{
		 											console.log(rows7);
		 											
		 											for(var i=0;i<rows7.length;i++){
		 												var d1=new Date(rows7[i].date_created);
		 												//console.log(d1.getFullYear());
		 												var d2=new Date();
		 												//console.log(d2.getTime());
		 												var timeDiff = Math.abs(d2.getTime() - d1.getTime());
		 												var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		 												console.log(diffDays);
		 												if(diffDays<=5){
		 													//io.emit('general-question',rows7[i].question);
															notification_number++;
															console.log(notification_number);
															io.emit('noti',notification_number);
		 												}
		 											}
		 											
		 										}
		 										
		 										
		 									}); 	 	
  	 		  	 		 			}
  	 		  	 		 			
  	 		  	 		 			
  	 		  	 		 			
  	 		  	 		 		});
  	 		  	 		 				
  	 		 				 }
  	 		 					
  	 		 					
  	 		 				});
  	 		 				
  	 		 			}
  	 		 			
  	 		 			
  	 		 		});
  	 		 		
  	 		 		
  	 		 	
  	 
  	 		 				

//--------------------------------------------------------------------------------------------------------------------------//
  	 		 				
  	 		 	//emit all questions (profile + general )
  	 		 			//io.emit('question',sendques);			



  	 		 			});


  	 		 		});

  	 		 		}		 		
  	 		 	}	
  	 		 
  	 		 	
  	 		
  	 	});
  	
   });
   
  /* socket.on('general_hackathon',function(msg){
	   console.log('general_hackathon: '+msg);
	   
	   splt1=msg.split("-");
	   
	   var question_answer=splt1[0];
	   var question_id_answer=splt1[1];
	   
	   var insert_table_bot_answers={
		        
		        answer:question_answer,
		        bot_questions_id:question_id_answer,
		        user_id:user_id

		       };

		       connection.query("insert into bot_answers set ?",insert_table_bot_answers,function(err){

		         if(err){
		          console.log('error in inserting data in bot_answers');
		         }
		         
		         else{
		        	 console.log("insert query successful for general_hackathon");
		         }


		       });

   });*/
  	  	
 });

/*io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});*/


http.listen(8000, function(){
  console.log('listening to 8000*');
});
