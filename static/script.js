( function($) {
    'use strict';
    let soccerWays = []
    let title_link = []
    let date = ''
    
    $(document).ready( function(){
        $('#spinner-div3').hide();
        setInterval(() => {
            if ( $("input.show-btn").val() === "Show") {                
                $("textarea.each_team_textarea").css( "width", ( ($("div._link-edit").width()-100) / 4  ) ) ;            
            }
        }, 500);
        
        $("input#date").on( 'change', function(){            
            
            let soccerWays_temp = $("textarea#text1").val() ;            
            soccerWays = soccerWays_temp.split('\n') ;
            $("div._link-edit").empty();

            for ( let i = 0; i < soccerWays.length; i += 3) {
                let date_temp = $("input#date").val().split('-');
                date = date_temp[1]+ '/'+ date_temp[2]+ '/'+ date_temp[0]
                
                let temp = soccerWays[i] + ' vs. ' + soccerWays[i + 1] +' '+ date +' soccerway uk';
                let time = soccerWays[i+2] ;
                const each_html = '<div class="each_link" style="padding-top: 30px; padding-left: 20px;  "><input type="text" value="'+temp+'" class="form-control team-match'+i+'" style="margin-bottom: 10px;"/><input value="'+time+'" type="text" class="form-control time-match"'+i+'/><input type="button" value="Copy Match" class="btn btn-primary copy-match'+i+'" style="margin-right: 10px" /><input type="button" value="Paste Match" class="btn btn-primary paste-match'+i+'"/><textarea id="each_team'+i+'" style="height: 100px;" class="form-control each_team_textarea" placeholder="You will paste the teams here"></textarea></div> ' ;
                               
                $("div._link-edit").append( each_html ) ;                
                
                $("input.copy-match"+i).click( function(e){
                    let txt = $("input.team-match"+i).val() ;
                    $("input.team-match"+i).select() ;
                    console.log( txt )
                    navigator.clipboard.writeText( txt ) ;
                    // alert("Copied the text: "+ txt) ;
                });

                $("input.paste-match"+i).click( function(e){
                    navigator.clipboard.readText( ).then( (text) => {
                        $("textarea#each_team"+i).val(text) ;
                        $("textarea#each_team"+i).addClass('red-border');        
                    }) ;
                    $("textarea#each_team"+i).select() ;                    
                });
                
            }

        }  )
        
        $("input.show-btn").click( function(e) {                        
            if ( $("input.show-btn").val() === "Show") {
                $("div._link-edit").removeClass('show_inline') ;                
                $("textarea.each_team_textarea").css( "width", "100%" ) ;                
                $("div._link-edit").addClass('show_multi_line') ;
                $("input.show-btn").val("Hide") ;
            }
            else {                
                $("div._link-edit").removeClass('show_multi_line') ;
                $("div._link-edit").addClass('show_inline') ;
                
                $("textarea.each_team_textarea").css( "width", ( ($("div._link-edit").width()-100) / 4  ) ) ;                
                $("input.show-btn").val("Show") ;
            }
        });


        $("button.each-soccerway-process").click( function(e) {        
            $('#spinner-div4').show();
            for ( let i = 0; i < soccerWays.length; i += 3) {
                title_link = $("textarea#text3").val().split('\n') ;

                let temp = soccerWays[i] + ' vs. ' + soccerWays[i + 1]
                let hasTeam = $.grep( title_link, function(elem) {
                    if ( elem.indexOf( temp ) > -1 && elem.indexOf('2022') ) {
                        $("textarea#each_team"+i).addClass('red-border');        
                        $("textarea#each_team"+i).val( temp ) ;

                    }                    
                    return elem.indexOf( temp ) > -1 ;
                })
            }
            $('#spinner-div4').hide();            
        })
        
        $("button.finding-match").click( function(e){
            let soccerWays_link = $("textarea#text3").val().split('\n') ;
            let temp_text = ''
            $('#spinner-div').show();          
            let operationsCompleted  = 0 ;
            let myPromise = new Promise( async function(resolve, reject) {                
                for (var i = 0; i < soccerWays_link.length; i++) {     
                    $.ajax({
                        url: '/finding_match',
                        type: 'POST',
                        contentType: 'application/json;charset=UTF-8',
                        data:  soccerWays_link[i],
                        success: function( data, status, xhr)  {
                            if ( status === 'success' ) {                                    
                                temp_text += data.data
                                $("textarea#text3").val( temp_text ) ;
                                operationsCompleted++ ;                                
                                if ( operationsCompleted == soccerWays_link.length ) {
                                    $('#spinner-div').hide();                                    
                                }
                            }                        
                        },                        
                    })                    
                }                
            } ) ;                    
        })
        
        $("button.find-final-result").click( function(e) {
            let soccerWays_link = $("textarea#text3").val().split('\n');
            let temp_text = ''
            let team_rank_name = {}
            
            $('#spinner-div2').show();
            let operationsCompleted  = 0 ;
            let myPromise = new Promise( async function(resolve, reject) {
                for (var i = 0; i < soccerWays_link.length; i++) {
                    $.ajax({
                        url: '/finding_final',
                        type: 'POST',
                        contentType: 'application/json;charset=UTF-8',
                        data: soccerWays_link[i],                        
                        success: function( data, status, xhr ) {
                            if ( status === 'success' ) {
                                if ( data.data ){
                                    temp_text = $("textarea#text4").val( ) ;                                         
                                    let temp_rank = data.data.split('_')[0].replace('[', '').replace(']','').split(',') ;
                                    let temp_name = data.data.split('_')[1].replace('[', '').replace(']','').split(',') ;
                                    temp_rank.forEach( (elem, indx) => {
                                        temp_text += elem + '\n' + temp_name[indx] + '\n' ;
                                    })                                    
                                }
                                
                                $("textarea#text4").val( temp_text ) ;
                                
                                team_rank_name = Object.assign(team_rank_name, data.team_rank_name )                                
                                operationsCompleted++ ;
                                
                                if ( operationsCompleted == soccerWays_link.length ) {
                                    get_matched_team_rank( team_rank_name ) ;
                                    $('#spinner-div2').hide() ;
                                }                        
                            }
                        },                        
                    })
                }                
            })                
        })
        
        const get_matched_team_rank = function( team_rank_name ) {
                        
            $("tbody").empty() ; 
            for ( let i = 0; i < soccerWays.length; i += 3) {
                let teamNames = $("textarea#each_team"+i).val().split(' vs. ')
                let team_ranks_1 = '' ;
                let team_ranks_2 = '' ;
                
                Object.keys( team_rank_name ).forEach( key => {
                    if ( key === teamNames[0] ) {
                        teamNames[0] = team_rank_name[key] + ' ' + soccerWays[ i ]  // rank team_name
                        team_ranks_1 = ( team_rank_name[key] )
                    }
                    if ( key === teamNames[1]) {
                        teamNames[1] = team_rank_name[key] + ' ' + soccerWays[ i+1 ] // rank team_name
                        team_ranks_2 = ( team_rank_name[key] )  // team_ranks = rank_number
                    }
                }) ;
                                            
                if ( team_ranks_1 && team_ranks_2 ) {
                    
                    let standing_diff =  Math.abs( parseInt(team_ranks_1) - parseInt(team_ranks_2) )  - 1;                            
                    let time = soccerWays[i+2] ;

                    $("textarea#each_team"+i).val( teamNames[0]+' vs. '+ teamNames[1] )
                    const each_html = '<tr><td>'+team_ranks_1+' for '+ soccerWays[i]+' vs. '+team_ranks_2+' for '+ soccerWays[i+1] +'</td><td>'+ date +' </td><td>'+ time +'</td><td>'+ standing_diff +'</td></tr>' ;
                    
                    $("tbody").append( each_html ) ;                                                        
                }            
            }                
            $('#example').DataTable( {
                order: [[2, 'asc']],
                rowGroup: {
                    dataSrc: 2
                }
            } );
        } ;
        
    })    
}) ( jQuery );