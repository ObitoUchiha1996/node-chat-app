var socket=io(); 

//AutoScroll function
function scrollToBottom(){
    //Selectors
    var messages=jQuery('#messages');
    var newMessage=messages.children('li:last-child');
    //Heights
    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageHeight=newMessage.innerHeight();
    var lastMessageHeight=newMessage.prev().innerHeight();

    if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight>=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}
        socket.on('connect',function(){
            console.log('connected to server');

            //when the "/" page is open the index.html receives a form in which 
            //the submitted values are stored in window.location.search
            //then we use the deparam function(downloaded) to break that string
            //into an object which is stored in params

            var params=jQuery.deparam(window.location.search);

            socket.emit('join',params,function(err){
                if(err){
                    alert(err);
                    window.location.href='/';
                }else{
                    console.log('No Error');
                }
            });
        });

        socket.on('disconnect',function(){
            console.log('disconnected from server');
        });

        socket.on('updateUserList',function(users){
            var ol=jQuery('<ol></ol>');

            users.forEach(function(user){
                ol.append(jQuery('<li></li>').text(user));
            });

            //now we will add the people in the div, also we are using 
            //html instead of append since we do not want to update the list but
            //we want to refresh it
            jQuery('#users').html(ol);
        });

        socket.on('newMessage',function(message){
            var formattedTime=moment(message.createdAt).format('h:mm a');
            var template=jQuery('#message-template').html();
            var html=Mustache.render(template,{
                text:message.text,
                from:message.from,
                createdAt:formattedTime
            });
            
            jQuery('#messages').append(html);
            scrollToBottom();

            // console.log('new Message',message);
            // var li=jQuery('<li></li>');
            // li.text(`${message.from} ${formattedTime}:${message.text}`);

            // //above i simply created a new li(tag) and set its value
            // //below i will add this li to the ol in Index.html file
            // jQuery('#messages').append(li);
        });

        jQuery('#message-form').on('submit',function(e){
            e.preventDefault();

            var messageTextBox=jQuery('[name=message]');

            socket.emit('createMessage',{
                text:messageTextBox.val()
            },function(){
                messageTextBox.val(null);
            });
        });

        var locationButton=jQuery('#send-location');
        locationButton.on('click',function(){
            if(!navigator.geolocation){
                return alert('Geolocation not supported by the browser');
            }

            locationButton.attr('disabled','disabled').text('sending location...');

            navigator.geolocation.getCurrentPosition(function(position){
                locationButton.removeAttr('disabled').text('Send location');
                socket.emit('createLocationMessage',{
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude
                });
            },function(){
                locationButton.removeAttr('disabled').text('Send location');
                alert('Not able to fetch location');
            });
        });

        socket.on('newLocationMessage',function(locationMessage){

            var formattedTime=moment(locationMessage.createdAt).format('h:mm a');
            var template=jQuery('#location-message-template').html();
            var html=Mustache.render(template,{
                url:locationMessage.url,
                from:locationMessage.from,
                createdAt:formattedTime
            });
            
            jQuery('#messages').append(html);
            scrollToBottom();

            // console.log('new Message',locationMessage);
            // var formattedTime=moment(locationMessage.createdAt).format('h:mm a');
            // var li=jQuery('<li></li>');
            // var a=jQuery('<a target="_blank">My current location</a>')
            // li.text(`${locationMessage.from} ${formattedTime}: `);
            // a.attr('href',locationMessage.url);
            // li.append(a);
            // jQuery('#messages').append(li);
        });