$( document ).ready(function() {
    
    if(window.location.pathname == '/login' || window.location.pathname == '/feedback'){
        var radioButtons = document.getElementsByClassName('radioSelect');

        for (var j = 0; j < radioButtons.length; j++) {
            (function(radio) {
                radioButtons[j].style.backgroundColor = "white";
                radio.addEventListener('click', function(e) {
                    e.target.parentNode.parentNode.style.backgroundColor = "skyblue";
                    setTimeout(function(){
                        e.target.parentNode.parentNode.style.backgroundColor = "white";
                    },2000);
                });
            })(radioButtons[j]);
        }
        
        // Feedback Form Validation. 
        var submitBtn = document.getElementsByClassName('selectOption')[0];
        submitBtn.addEventListener('submit',function(e){
            e.preventDefault(); //stop submit

            var radioSelect = document.getElementsByClassName("radioSelect");

            // Check if one of the radio button is checked or not.
            for(var i=0;i<radioSelect.length;i++){
                if(radioSelect[i].checked){
                    document.getElementById('feedbacktype').value = radioSelect[i].nextElementSibling.textContent;
                    $('#exampleModal').modal('show');
                    return true;            
                }
            }
            return false;
        });
        
    }



    
});