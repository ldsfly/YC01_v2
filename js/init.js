
window.IMG_ROOT  = 'http://www.gudidea.com/domains/wy.gudidea.com/sites/01/file/image/';
window.AJAX_ROOT = 'http://01.wy.gudidea.com/';

window.sync = new ALF_sync();

(function(){
	
	
	if( is_empty(get_s('my.yichu')) ){
		
		var default_data = {
			'1':{
				id:1,
				name:"上衣"
			},
			'2':{
				id:2,
				name:"裤子"
			},
			'3':{
				id:3,
				name:"裙子"
			},
			'4':{
				id:4,
				name:"鞋子"
			},
			'5':{
				id:5,
				name:"包包"
			},
			'6':{
				id:6,
				name:"饰品"
			},
			'7':{
				id:7,
				name:"化妆品"
			},
			'8':{
				id:8,
				name:"单品"
			}
		}
		
		set_o('my.yichu',default_data);
		
	}
	
})();



jQuery(document).on("mobileinit", function(){
	jQuery.mobile.defaultPageTransition = 'none';
	
	window.data_init = {};
	
});


jQuery( document ).on( "pagebeforeshow", function( e ) {
  var $page = jQuery(e.target);
	var page_id = $page.attr('id');
	
	var ls_username = jQuery.trim(get_s('u_username'));
	var ls_password = jQuery.trim(get_s('u_password'));
	
	if( ls_username && ls_password ){
	}else{
		if( page_id != 'page-login' && page_id != 'page-register' ){
			jQuery.mobile.changePage( 'index.html',{reloadPage:true} );
		}
	}
})


jQuery( document ).on( "pageshow", function( e ) {
	jQuery('.js_ios_slider').iosSlider({
		snapToChildren: true,
		desktopClickDrag: true,
		keyboardControls: true
	});
});


/* 登录 */
jQuery( document ).on( "pagebeforecreate", "#page-index", function( e ) {
	
	var ls_username = jQuery.trim(get_s('u_username'));
	var ls_password = jQuery.trim(get_s('u_password'));
	
	if( ls_username && ls_password ){
		//jQuery.mobile.changePage( 'home.html',{reloadPage:true} );
	}
	
});



/* 登录 */
jQuery( document ).on( "pagebeforecreate", "#page-login", function( e ) {
  var $page = jQuery(e.target);
	var $username = $page.find('.js_username');
	var $password = $page.find('.js_password');
	var $btn_login = $page.find('.js_login');
	
	var ls_username = get_s('u_username');
	var ls_password = get_s('u_password');
	
	$username.val(ls_username);
	$password.val(ls_password);
	
	$btn_login.click(function(){
		var username = jQuery.trim($username.val());
		var password = jQuery.trim($password.val());
		
		login( username,password,function success(){
			jQuery.mobile.changePage('home.html',{reloadPage:true});
		},function fail(){
			
		} )
	});
	
});


/* 注册 */
jQuery( document ).on( "pagebeforecreate", "#page-register", function( e ) {
  var $page = jQuery(e.target);
	var $username = $page.find('.js_username');
	var $password_1 = $page.find('.js_password_1');
	var $password_2 = $page.find('.js_password_2');
	var $btn_reg = $page.find('.js_register');
	
	$btn_reg.click(function(){
		var username = jQuery.trim($username.val());
		var password_1 = jQuery.trim($password_1.val());
		var password_2 = jQuery.trim($password_2.val());
		
		if( username && password_1 && password_2 ){
			if( password_1 == password_2 ){
				send_ajax('user.create',{
					'name':username,
					'password':password_1
				},function(data){
					if( data.status ){
						$username.val('');
						$password_1.val('');
						$password_2.val('');
						toast('恭喜，注册成功！');
						jQuery.mobile.changePage('index.html',{reloadPage:true});
					}else{
						if(data.error.description == 'already_exists'){
							toast('用户名已存在，请换一个用户名。');
						}
					}
				},function(){
					toast('访问失败，请检查网络。');
				})
			}else{
				toast('两次输入的密码不一致，请修改。');
			}
		}else{
			toast('请输入用户名和密码。');
		}
		
	});
	
});






/* 我的设置－》尺寸 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-size", function( e ) {
  var $page = jQuery(e.target);
	
	$page.find('.js_save').click(function(){
		save_db_data($page,function(){
			tick_version('user');
			sync.add('user','edit',0);
			//sync_user_data();
			toast('保存成功！');
			jQuery.mobile.changePage('my_sz.html',{reloadPage:true,reverse:true});
		});
	});
	init_db_data($page);
});

/* 我的设置－》积分 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-point", function( e ) {
  var $page = jQuery(e.target);
	var key = get_s ('my.settings.point');
	
	init_db_data($page);
	
	$page.on('pagebeforeshow',function(){
		send_ajax('user.current',{},function(data){
			set_s ('my.settings.point',data.data.score);
			init_db_data($page);
		});
	})
});

/* 我的设置－》品牌 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-brand", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'brand';
	var data_key = 'my.settings.'+page_key;
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	
	/* START DELETE action */
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		var from_remote_id = $from.data('remote_id');
		
		var list_da = get_o(data_key);
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		
		sync.add(page_key,'del',from_id,from_remote_id);
		
		toast('删除成功！');
		
	});
	/* END DELETE action */
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			//console.log(list_da);
			
			for( k in list_da ){
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="my_sz_'+page_key+'_add.html?id='+list_da[k].id+'"><img src="'+list_da[k].local_uri+'?_='+random_string()+'" width="80" height="80"><h2>'+list_da[k].name+'</h2></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				var $del = $li.find('.js_delete');
				
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
				})();
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){

		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						var local_id = random_string();
						var local_obj = {};
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						local_obj.remote_uri = cur_i.img;
						local_obj.local_uri = 'images/thumb_default@2x.png';
						
						//get img
						(function(){
							var hash_id = local_id;
							var remote_id = local_obj.remote_id;
							
							send_ajax(page_key+'.detail',{id:local_obj.remote_id},function(data){
								console.log(data);
								if( data.status ){
									if( data.data.images.length ){
										var remote_filename = data.data.images[0];
										var remote_url = IMG_ROOT + remote_id + '/' +remote_filename;
										
										console.log('START DOWNLOAD : ' + remote_url);
										
										download_img_to_local(remote_url,function(local_uri){
											if( local_uri ){
												var list_da = get_o(data_key);
												if( list_da[hash_id] ){
													list_da[hash_id].local_uri = local_uri;
													set_o(data_key,list_da);
													jQuery('[data-id='+hash_id+']').find('img').attr('src','').attr('src',local_uri+'?_='+random_string());
												}
											}
										});								
									}
								}
							});
						})();
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
});

/* 我的设置－》品牌 ->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-brand-add", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'brand';
	var data_key = 'my.settings.'+page_key;
	
	var $name = $page.find('.js_name');
	var $id = $page.find('.js_id');
	var $photo_uri = $page.find('.js_photo_uri_2');
	var $btn_save = $page.find('.js_save');
	
	init_photo_add_list($page);
	
	$btn_save.click(function(){
		var photo_uri = $photo_uri.val();
		var id = jQuery.trim($id.val()) || 0;
		var name = jQuery.trim($name.val());
		
		console.log(id)
		
		if( photo_uri && name ){
			
			var list_da =  get_o(data_key);
			list_da = ( list_da instanceof Object )?list_da:{};
			
			var mode = 'edit';
			if ( !id ){
				mode = 'add';
				id = random_string();
				list_da[id]={};
			}
			
			list_da[id]['id'] = id;
			list_da[id]['is_sync'] = false;
			list_da[id]['name'] = name;
			list_da[id]['local_uri'] = photo_uri;
			
			set_o(data_key,list_da);
			
			$id.val('');
			$photo_uri.val('');
			$name.val('');
			
			sync.add(page_key,mode,id);
			
			toast('保存成功！');
			jQuery.mobile.changePage('my_sz_'+page_key+'.html',{reloadPage:true,reverse:true});
		}else{
			toast('请填好所有选项。');
			return false;
		}
	});
	
	$page.on("pagebeforeshow",function(e){
		var $page = jQuery(e.target);
		
		var $name = $page.find('.js_name');
		var $id = $page.find('.js_id');
		var $photo_uri = $page.find('.js_photo_uri_2');
		var $photo_preview = $page.find('.js_photo_preview_2');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var id = jQuery.url('?id',page_url) || '';
		
		if( id ){
			var list_da =  get_o(data_key);
			if( typeof list_da[id] == 'object' ){
				$name.val(list_da[id]['name']);
				$id.val(list_da[id]['id']);
				$photo_uri.val(list_da[id]['local_uri']);
				$photo_preview.attr('src',list_da[id]['local_uri']+'?_='+random_string());
			}
		}
		$id.val(id);
	});
	
});

/* 我的设置－》颜色 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-color", function( e ) {
	
	var $page = jQuery(e.target);
	var page_key = 'color';
	var data_key = 'my.settings.'+page_key;
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	
	/* START DELETE action */
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		var from_remote_id = $from.data('remote_id');
		
		var list_da = get_o(data_key);
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		
		sync.add(page_key,'del',from_id,from_remote_id);
		
		toast('删除成功！');
		
	});
	/* END DELETE action */
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			//console.log(list_da);
			
			for( k in list_da ){
				
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="my_sz_'+page_key+'_add.html?id='+list_da[k].id+'"><h2>'+list_da[k].name+'</h2></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				
				var $del = $li.find('.js_delete');
				
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
				})();
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){

		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						var local_id = random_string();
						var local_obj = {};
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
	
});

/* 我的设置－》颜色 ->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-color-add", function( e ) {
	 
	var $page = jQuery(e.target);
	var page_key = 'color';
	var data_key = 'my.settings.'+page_key;
	
	var $name = $page.find('.js_name');
	var $id = $page.find('.js_id');
	
	var $btn_save = $page.find('.js_save');
	
	$btn_save.click(function(){
		var id = jQuery.trim($id.val()) || 0;
		var name = jQuery.trim($name.val());
		
		console.log(id)
		
		if( name ){
			
			var list_da =  get_o(data_key);
			list_da = ( list_da instanceof Object )?list_da:{};
			
			var mode = 'edit';
			if ( !id ){
				mode = 'add';
				id = random_string();
				list_da[id]={};
			}
			
			list_da[id]['id'] = id;
			list_da[id]['is_sync'] = false;
			list_da[id]['name'] = name;
			
			set_o(data_key,list_da);
			
			$id.val('');
			$name.val('');
			
			sync.add(page_key,mode,id);
			
			toast('保存成功！');
			jQuery.mobile.changePage('my_sz_'+page_key+'.html',{reloadPage:true,reverse:true});
		}else{
			toast('请填好所有选项。');
			return false;
		}
	});
	
	$page.on("pagebeforeshow",function(e){
		var $page = jQuery(e.target);
		
		var $name = $page.find('.js_name');
		var $id = $page.find('.js_id');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var id = jQuery.url('?id',page_url) || '';
		
		if( id ){
			var list_da =  get_o(data_key);
			if( typeof list_da[id] == 'object' ){
				$name.val(list_da[id]['name']);
				$id.val(list_da[id]['id']);
			}
		}
		$id.val(id);
	});
});

/* 我的设置－》标签 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-tag", function( e ) {
	
	var $page = jQuery(e.target);
	var page_key = 'tag';
	var data_key = 'my.settings.'+page_key;
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	
	/* START DELETE action */
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		var from_remote_id = $from.data('remote_id');
		
		var list_da = get_o(data_key);
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		
		sync.add(page_key,'del',from_id,from_remote_id);
		
		toast('删除成功！');
		
	});
	/* END DELETE action */
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			//console.log(list_da);
			
			for( k in list_da ){
				
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="my_sz_'+page_key+'_add.html?id='+list_da[k].id+'"><h2>'+list_da[k].name+'</h2></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				
				var $del = $li.find('.js_delete');
				
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
				})();
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){

		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						var local_id = random_string();
						var local_obj = {};
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
});

/* 我的设置－》标签 ->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-tag-add", function( e ) {
	 
	var $page = jQuery(e.target);
	var page_key = 'tag';
	var data_key = 'my.settings.'+page_key;
	
	var $name = $page.find('.js_name');
	var $id = $page.find('.js_id');
	
	var $btn_save = $page.find('.js_save');
	
	$btn_save.click(function(){
		var id = jQuery.trim($id.val()) || 0;
		var name = jQuery.trim($name.val());
		
		console.log(id)
		
		if( name ){
			
			var list_da =  get_o(data_key);
			list_da = ( list_da instanceof Object )?list_da:{};
			
			var mode = 'edit';
			if ( !id ){
				mode = 'add';
				id = random_string();
				list_da[id]={};
			}
			
			list_da[id]['id'] = id;
			list_da[id]['is_sync'] = false;
			list_da[id]['name'] = name;
			
			set_o(data_key,list_da);
			
			$id.val('');
			$name.val('');
			
			sync.add(page_key,mode,id);
			
			toast('保存成功！');
			jQuery.mobile.changePage('my_sz_'+page_key+'.html',{reloadPage:true,reverse:true});
		}else{
			toast('请填好所有选项。');
			return false;
		}
	});
	
	$page.on("pagebeforeshow",function(e){
		var $page = jQuery(e.target);
		
		var $name = $page.find('.js_name');
		var $id = $page.find('.js_id');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var id = jQuery.url('?id',page_url) || '';
		
		if( id ){
			var list_da =  get_o(data_key);
			if( typeof list_da[id] == 'object' ){
				$name.val(list_da[id]['name']);
				$id.val(list_da[id]['id']);
			}
		}
		$id.val(id);
	});
  
});

/* 我的设置－》账号 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-account", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'account';
	var data_key = 'my.settings.account';
	var $list = $page.find('.js_list');
	var $delete_pop = $page.find('#delete_pop');
	var $switch_pop = $page.find('#switch_pop');
	
	
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		
		var list_da = get_o(data_key);
		
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		toast('删除成功！');
	});
	
	$switch_pop.find('.js_ok').click(function(){
		var $from = $switch_pop.data('from_li');
		var from_id = $from.data('id');

		var list_da = get_o(data_key);
		var cur_user_id = get_s('cur_user_id');
		
		if( from_id!=cur_user_id ){
			var selected_user = list_da[from_id];
			
			login( selected_user.username,selected_user.password,function success(data){
				set_s('cur_user_id',data.id);
				build_list();
				toast('现在用户已切换到 ' +data.name);
			},function fail(){
				jQuery.mobile.changePage('my_sz_account_add.html',{reloadPage:true});
			} )
			
		}
		
	});
	

	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		var cur_user_id = get_s('cur_user_id');
		
		$list.empty();
		if( !is_empty(list_da) ){
			for( k in list_da ){
				var $li = jQuery('<li data-id="'+list_da[k].id+'"><a href="#switch_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_lic"><img src="'+(list_da[k].avatar||'images/thumb_default@2x.png')+'" width="80" height="80"><h2>'+list_da[k].username+'</h2><p>'+list_da[k].email+'</p></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				if( cur_user_id == k ){
					$li = jQuery('<li data-id="'+list_da[k].id+'" data-theme="b"><a href="#" data-icon="delete" class="js_lic"><img src="'+(list_da[k].avatar||'images/thumb_default@2x.png')+'" width="80" height="80"><h2>'+list_da[k].username+'</h2><p>'+list_da[k].email+'</p></a> <a data-icon="check"></a></li>');
				}
				var $del = $li.find('.js_delete');
				var $lic = $li.find('.js_lic');
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
					$lic.click(function(){
						$switch_pop.data('from_li',_$li);
						$switch_pop.find('.js_username').text(_$li.find('h2').text());
					});
				})();
				$list.append($li);
			}
		}
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
});

/* 我的设置－》账号 ->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-account-add", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'account';
	var data_key = 'my.settings.account';
	
	var $username = $page.find('.js_username');
	var $password = $page.find('.js_password');
	var $btn_save = $page.find('.js_save');
	
	$btn_save.click(function(){
		var username = jQuery.trim($username.val());
		var password = jQuery.trim($password.val());
		
		login( username,password,function(data){
			jQuery.mobile.changePage('my_sz_account.html',{reloadPage:true});
		},function(){
			
		} )
		
	});
});

/* 我的设置－》密码 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-password", function( e ) {
  var $page = jQuery(e.target);
	
	var $old_password = $page.find('.js_old_password');
	var $new_password_1 = $page.find('.js_new_password_1');
	var $new_password_2 = $page.find('.js_new_password_2');
	var $btn_save = $page.find('.js_save');
	
	
	$btn_save.click(function(){
		var old_password = jQuery.trim($old_password.val());
		var new_password_1 = jQuery.trim($new_password_1.val());
		var new_password_2 = jQuery.trim($new_password_2.val());
		
		if( old_password && new_password_1 && new_password_2 ){
			
			if( new_password_1 != new_password_2 ){
				toast('新密码两次输入不同，请修改。');
				return false;
			}
			
			if( old_password == new_password_2 ){
				toast('新旧密码必须不同，请修改。');
				return false;
			}
			
			send_ajax('user.password.change',{
				'old':old_password,
				'new':new_password_1
			},function(data){
				if( data.status ){
					toast('恭喜，密码修改成功！');
					$old_password.val('');
					$new_password_1.val('');
					$new_password_2.val('');
					
					jQuery.mobile.changePage('my_sz.html',{reloadPage:true});
				}else{
					if( data.error.description == 'wrong_old' ){
						toast('旧密码错误，请重试。');
					}
				}
				console.log(data);
			},function(){
				toast('访问失败，请检查网络。');
			});
		}else{
			toast('请输入密码。');
		}
		
	});
})

/* 我的设置－》意见反馈 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz-feedback", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'feedback';
	
	var $feedback = $page.find('.js_feedback');
	var $btn_submit = $page.find('.js_submit');
	
	$btn_submit.click(function(){
		var feedback = jQuery.trim($feedback.val());
		
		if( feedback ){
			send_ajax( 'feedback.create',{
				'name':get_s('cur_user_id'),
				'description':feedback
			},function success(){
				toast('您的反馈已提交，感谢您的支持。');
				$feedback.val('');
			},function fail(){
				toast('提交失败，请稍候再试。');
			} )
			
		}else{
			toast('请输入内容。');
		}
		
	});
});

/* 我的设置 */
jQuery( document ).on( "pagebeforecreate", "#page-my-sz", function( e ) {
  var $page = jQuery(e.target);
	
	var $btn_quit = $page.find('.js_quit');
	var $pop_quit = $page.find('#pop_quit');
	
	$pop_quit.find('.js_ok').click(function(){
		set_s('u_username','');
		set_s('u_password','');
		set_s('user_ver','');
		jQuery.mobile.changePage('index.html',{reloadPage:true,reverse:true});
		return false;
	});	
});

/* 我的衣橱 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yc", function( e ) {
	
	var $page = jQuery(e.target);
	var page_key = 'yichu';
	var data_key = 'my.yichu';
		
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			var my_single = get_o('my.single');
			
			for( k in list_da ){
				
				var cat_count = 0;
				for( var l in my_single ){
					if( my_single[l].cat == list_da[k].id ){
						cat_count ++;
					}
				}
				
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="my_yc_single.html?id='+list_da[k].id+'"><h2>'+list_da[k].name+'（'+cat_count+'）</h2></a></li>');
				
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){
		
		var page_key = 'single';
		var data_key = 'my.single';
		
		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						console.log(cur_i);
						
						var local_id = random_string();
						var local_obj = JSON.parse(cur_i.description);
						
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						//local_obj.remote_uri = cur_i.img;
						//local_obj.local_uri_1 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_2 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_3 = 'images/thumb_default@2x.png';
						
						//get img
						(function(){
							var hash_id = local_id;
							var remote_id = local_obj.remote_id;
							
							if( local_obj.local_uri_1 ){
								
								console.log('DOWNLOAD');
								var suffix = local_obj.local_uri_1.substr(local_obj.local_uri_1.lastIndexOf('.'));
								var remote_filename_1 = remote_id+'_1' + suffix;
								var remote_url_1 = IMG_ROOT + remote_id + '/' + remote_filename_1;
								console.log('START DOWNLOAD : ' + remote_url_1);
								download_img_to_local(remote_url_1,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_1 = local_uri;
											set_o(data_key,list_da);
											jQuery('[data-id='+hash_id+']').find('img').attr('src','').attr('src',local_uri+'?_='+random_string());
										}
									}
								});	
							}

							if( local_obj.local_uri_2 ){
								var suffix = local_obj.local_uri_2.substr(local_obj.local_uri_2.lastIndexOf('.'));
								var remote_filename_2 = remote_id+'_2' + suffix;
								var remote_url_2 = IMG_ROOT + remote_id + '/' +remote_filename_2;
								console.log('START DOWNLOAD : ' + remote_url_2);
								download_img_to_local(remote_url_2,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_2 = local_uri;
											set_o(data_key,list_da);
										}
									}
								});	
							}
							
							if( local_obj.local_uri_3 ){
								var suffix = local_obj.local_uri_3.substr(local_obj.local_uri_3.lastIndexOf('.'));
								var remote_filename_3 = remote_id+'_3' + suffix;
								var remote_url_3 = IMG_ROOT + remote_id + '/' +remote_filename_3;
								console.log('START DOWNLOAD : ' + remote_url_3);
								download_img_to_local(remote_url_3,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_3 = local_uri;
											set_o(data_key,list_da);
										}
									}
								});
							}
							
							
						})();
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
	
	
	
});

/* 我的衣橱－》分类添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yc-add", function( e ) {
  var $page = jQuery(e.target);
	
	var $name = $page.find('.js_name');
	var $id = $page.find('.js_id');
	var $btn_save = $page.find('.js_save');
	
	$btn_save.click(function(){
		var id = jQuery.trim($id.val());
		var name = jQuery.trim($name.val());
		
		if( name ){
			var key = 'my.yichu';
			var list_da =  get_o(key);
			list_da = ( list_da instanceof Object )?list_da:{};
			var next_id = id;
			if ( !id ){
				next_id = random_string();
			}
			
			list_da[next_id] = {
				'id':next_id,
				'name':name
			};
			set_o(key,list_da);
			
			$id.val('');
			$name.val('');
			
			toast('保存成功！');
			jQuery.mobile.changePage('my_yc.html',{reloadPage:true,reverse:true});
		}else{
			toast('请填好所有选项。');
			return false;
		}
	});
	
	$page.on("pagebeforeshow",function(e){
		var $page = jQuery(e.target);
	
		var $name = $page.find('.js_name');
		var $id = $page.find('.js_id');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var id = jQuery.url('?id',page_url) || '';
		
		if( id ){
			var key = 'my.yichu';
			var list_da =  get_o(key);
			if( typeof list_da[id] == 'object' ){
				$name.val(list_da[id]['name']);
				$id.val(list_da[id]['id']);
			}
		}
		$id.val(id);
	});

	
});


/* 我的衣橱 －》单品列表 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yc-single", function( e ) {
	
	var $page = jQuery(e.target);
	var page_key = 'single';
	var data_key = 'my.single';
	
	var page_url = e.target.baseURI;
	var id = jQuery.url('?id',page_url) || '';
		
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	var $add = $page.find('.js_add');
	
	$add.attr('href','my_yc_single_add.html?cat='+id);
	
	/* START DELETE action */
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		var from_remote_id = $from.data('remote_id');
		
		var list_da = get_o(data_key);
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		
		sync.add(page_key,'del',from_id,from_remote_id);
		
		toast('删除成功！');
		
	});
	/* END DELETE action */
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		
		if( id ){
			for( var k in list_da ){
				if( list_da[k]['cat'] != id ){
					delete list_da[k];
				}
			}
		}
		
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			//console.log(list_da);
			
			for( k in list_da ){
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="my_yc_'+page_key+'_add.html?id='+list_da[k].id+'&cat='+id+'"><img src="'+list_da[k].local_uri_1+'?_='+random_string()+'" width="80" height="80"><h2>'+list_da[k].name+'</h2></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				
				
				//var $li = jQuery('<li data-id="'+list_da[k].id+'"><a href="my_yc_single_add.html?id='+list_da[k].id+'&cat='+id+'"><img src="'+list_da[k].local_uri_1+'" width="80" height="80"><h2>'+list_da[k].name+'</h2></a> <a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				
				
				var $del = $li.find('.js_delete');
				
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
				})();
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){

		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						console.log(cur_i);
						
						var local_id = random_string();
						var local_obj = JSON.parse(cur_i.description);
						
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						//local_obj.remote_uri = cur_i.img;
						//local_obj.local_uri_1 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_2 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_3 = 'images/thumb_default@2x.png';
						
						//get img
						(function(){
							var hash_id = local_id;
							var remote_id = local_obj.remote_id;
							
							if( local_obj.local_uri_1 ){
								
								console.log('DOWNLOAD');
								var suffix = local_obj.local_uri_1.substr(local_obj.local_uri_1.lastIndexOf('.'));
								var remote_filename_1 = remote_id+'_1' + suffix;
								var remote_url_1 = IMG_ROOT + remote_id + '/' + remote_filename_1;
								console.log('START DOWNLOAD : ' + remote_url_1);
								download_img_to_local(remote_url_1,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_1 = local_uri;
											set_o(data_key,list_da);
											jQuery('[data-id='+hash_id+']').find('img').attr('src','').attr('src',local_uri+'?_='+random_string());
										}
									}
								});	
							}

							if( local_obj.local_uri_2 ){
								var suffix = local_obj.local_uri_2.substr(local_obj.local_uri_2.lastIndexOf('.'));
								var remote_filename_2 = remote_id+'_2' + suffix;
								var remote_url_2 = IMG_ROOT + remote_id + '/' +remote_filename_2;
								console.log('START DOWNLOAD : ' + remote_url_2);
								download_img_to_local(remote_url_2,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_2 = local_uri;
											set_o(data_key,list_da);
										}
									}
								});	
							}
							
							if( local_obj.local_uri_3 ){
								var suffix = local_obj.local_uri_3.substr(local_obj.local_uri_3.lastIndexOf('.'));
								var remote_filename_3 = remote_id+'_3' + suffix;
								var remote_url_3 = IMG_ROOT + remote_id + '/' +remote_filename_3;
								console.log('START DOWNLOAD : ' + remote_url_3);
								download_img_to_local(remote_url_3,function(local_uri){
									if( local_uri ){
										var list_da = get_o(data_key);
										if( list_da[hash_id] ){
											list_da[hash_id].local_uri_3 = local_uri;
											set_o(data_key,list_da);
										}
									}
								});
							}
							
							
						})();
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
	
});

/* 我的设置－》衣橱 －》 单品 ->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yc-single-add", function( e ) {
  var $page = jQuery(e.target);
	
	var page_key = 'single';
	var data_key = 'my.single';
	
	var $name = $page.find('.js_name');
	var $cat = $page.find('.js_cat');
	var $id = $page.find('.js_id');
	
	var $photo_uri_1 = $page.find('.js_photo_uri_1');
	var $photo_uri_2 = $page.find('.js_photo_uri_2');
	var $photo_uri_3 = $page.find('.js_photo_uri_3');
	
	var $week = $page.find('.js_week');
	var $season = $page.find('.js_season');
	var $scene = $page.find('.js_scene');
	var $brand = $page.find('.js_brand');
	var $fabric = $page.find('.js_fabric');
	var $color = $page.find('.js_color');
	var $style = $page.find('.js_style');
	var $custom_tag = $page.find('.js_custom_tag');
	var $mood = $page.find('.js_mood');
	
	var $btn_save = $page.find('.js_save');
	
	init_photo_add_list($page);

	//init cat
	var cat_list = get_o('my.yichu');
	var cat_options_html = '<option value="">请选择</option>';
	for( var k in cat_list ){
		cat_options_html +='<option value="'+cat_list[k].id+'">'+cat_list[k].name+'</option>';
	}
	$cat.empty().append(cat_options_html);


	//init brand
	var brand_list = get_o('my.settings.brand');
	var brand_options_html = '<option value="">请选择</option>';
	for( var k in brand_list ){
		brand_options_html +='<option value="'+brand_list[k].id+'">'+brand_list[k].name+'</option>';
	}
	$brand.empty().append(brand_options_html);

	
	//init color
	var color_list = get_o('my.settings.color');
	var color_options_html = '<option value="">请选择</option>';
	for( var k in color_list ){
		color_options_html +='<option value="'+color_list[k].id+'">'+color_list[k].name+'</option>';
	}
	$color.empty().append(color_options_html);
	
	$btn_save.click(function(){
		var name = $name.val();
		var cat = $cat.val();
		
		var photo_uri_1 = $photo_uri_1.val();
		var photo_uri_2 = $photo_uri_2.val();
		var photo_uri_3 = $photo_uri_3.val();
		
		var week = [];
		$week.filter(':checked').each(function(){
			week.push(jQuery(this).val());
		});
		
		var season = [];
		$season.filter(':checked').each(function(){
			season.push(jQuery(this).val());
		});
		
		var scene = [];
		$scene.filter(':checked').each(function(){
			scene.push(jQuery(this).val());
		});
		
		var brand = $brand.val();
		var fabric = $fabric.val();
		var color = $color.val();
		var style = $style.val();
		var custom_tag = $custom_tag.val();
		var mood = $mood.val();
		
		var id = jQuery.trim($id.val());
		
		if( photo_uri_1 && name ){
			var key = 'my.single';
			var list_da =  get_o(key);
			list_da = ( list_da instanceof Object )?list_da:{};
			
			var mode = 'edit';
			if ( !id ){
				mode = 'add';
				id = random_string();
				list_da[id]={};
			}
			
			list_da[id].id = id;
			list_da[id].name = name;
			list_da[id].cat = cat;
			list_da[id].local_uri_1 = photo_uri_1?photo_uri_1:'';
			list_da[id].local_uri_2 = photo_uri_2?photo_uri_2:'';
			list_da[id].local_uri_3 = photo_uri_3?photo_uri_3:'';;
			list_da[id].week = week;
			list_da[id].season = season;
			list_da[id].scene = scene;
			list_da[id].brand = brand;
			list_da[id].fabric = fabric;
			list_da[id].color = color;
			list_da[id].style = style;
			list_da[id].custom_tag = custom_tag;
			list_da[id].mood = mood;
			list_da[id].id = id;
			
			set_o(key,list_da);
			
			sync.add(page_key,mode,id);
			
			$id.val('');
			$cat.val('');
			$photo_uri_1.val('');
			$photo_uri_2.val('');
			$photo_uri_3.val('');
			$name.val('');
			$week.attr('selected',false);
			$season.attr('selected',false);
			$scene.attr('selected',false);
			$brand.val('');
			$fabric.val('');
			$color.val('');
			$style.val('');
			$custom_tag.val('');
			$mood.val('');
			
			toast('保存成功！');
			jQuery.mobile.changePage('my_yc_single.html?id='+cat,{reloadPage:true,reverse:true});
		}else{
			toast('请填写单品名并至少添加一张图片。');
			return false;
		}
	});
	
	$page.on("pagebeforeshow",function(e){
		var $page = jQuery(e.target);
		
		var $name = $page.find('.js_name');
		var $cat = $page.find('.js_cat');
		var $id = $page.find('.js_id');
		
		var $photo_uri_1 = $page.find('.js_photo_uri_1');
		var $photo_uri_2 = $page.find('.js_photo_uri_2');
		var $photo_uri_3 = $page.find('.js_photo_uri_3');
		
		var $photo_preview_1 = $page.find('.js_photo_preview_1');
		var $photo_preview_2 = $page.find('.js_photo_preview_2');
		var $photo_preview_3 = $page.find('.js_photo_preview_3');
		
		var $week = $page.find('.js_week');
		var $season = $page.find('.js_season');
		var $scene = $page.find('.js_scene');
		var $brand = $page.find('.js_brand');
		var $fabric = $page.find('.js_fabric');
		var $color = $page.find('.js_color');
		var $style = $page.find('.js_style');
		var $custom_tag = $page.find('.js_custom_tag');
		var $mood = $page.find('.js_mood');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var id = jQuery.url('?id',page_url) || '';
		var cat = jQuery.url('?cat',page_url) || '';
		
		var $btn_back = $page.find('.js_back');
		$btn_back.attr('href','my_yc_single.html?id='+cat);
		
		if( cat ){
			$cat.val(cat).change();
		}
		
		if( id ){
			var key = 'my.single';
			var list_da =  get_o(key);
			
			if( typeof list_da[id] == 'object' ){
				var o = list_da[id];
				
				$name.val(o['name']);
				$id.val(o['id']);
				
				/*
				$cat.find('option').each(function(index, element) {
					var $this = jQuery(this);
					var this_value = $this.val();
					if( this_value == o['cat'] ){
						$this.attr('selected',true);
					}else{
						$this.attr('selected',false);
					}
				});
				*/
				$cat.val(o['cat']).change();
				
				$photo_uri_1.val(o['local_uri_1']);
				$photo_uri_2.val(o['local_uri_2']);
				$photo_uri_3.val(o['local_uri_3']);
				
				$photo_preview_1.attr( 'src',o['local_uri_1'] );
				$photo_preview_2.attr( 'src',o['local_uri_2'] );
				$photo_preview_3.attr( 'src',o['local_uri_3'] );
				
				$week.each(function(index, element) {
					var $this = jQuery(this);
					var this_value = $this.val();
					for(var i=0;i<=o['week'].length;i++){
						if( o['week'][i] == this_value ){
							$this.attr('checked',true);
						}
					}
				});
				$week.checkboxradio('refresh');
				
				$season.each(function(index, element) {
					var $this = jQuery(this);
					var this_value = $this.val();
					for(var i=0;i<o['season'].length;i++){
						if( o['season'][i] == this_value ){
							$this.attr('checked',true);
						}
					}
				});
				$season.checkboxradio('refresh');
				
				$scene.each(function(index, element) {
					var $this = jQuery(this);
					var this_value = $this.val();
					for(var i=0;i<=o['scene'].length;i++){
						if( o['scene'][i] == this_value ){
							$this.attr('checked',true);
						}
					}
				});
				$scene.checkboxradio('refresh');		
				
				$brand.val(o['brand']).change();
				$fabric.val(o['fabric']).change();
				$color.val(o['color']).change();
				$style.val(o['style']).change();
				
				$custom_tag.val(o['custom_tag']);
				$mood.val(o['mood']);
				
			}
		}
		
	});
});

/* 我的设置－》衣橱 －》搭配 */
jQuery( document ).on( "pagebeforecreate", "#page-my-dp", function( e ) {
  var $page = jQuery(e.target);
	
	jQuery('.js_tab').each(function(){
		var $root = jQuery(this);
		var $btns = $root.find('.js_tab_btns li a');
		var $conts =$root.find('.js_tab_conts').children();
		
		$btns.each(function(index, element) {
      var $btn = jQuery(this);
			(function(){
				var _idx = index;
				$btn.click(function(){
					$conts.eq(_idx).show().siblings().hide();
					jQuery(this).addClass('ui-btn-active').siblings().removeClass('ui-btn-active');
				});
			})();
    });
		
		$btns.eq(0).click();
		
	});
	
	jQuery('.js_datepicker').datepicker({
	  onSelect:function(date){
			jQuery.mobile.changePage('my_dp_list.html?date='+date,{reloadPage:true});
		}
	});
	
	$page.on('pagebeforeshow',function(){
		
		var list_full = get_o('my.dapei');
		
		var scene_count = {};
		for( var k in list_full ){
			if( list_full[k].scene ){
				if( typeof scene_count[list_full[k].scene] == 'undefined' ){
					scene_count[list_full[k].scene]=0;
				}
				scene_count[list_full[k].scene] ++;
			}
		}
		
		jQuery('.js_scene_list li').each(function(index, element) {
      var idx = index + 1;
			if( scene_count[idx] ){
				jQuery(this).find('.js_count').text(scene_count[idx]);
			}else{
				jQuery(this).find('.js_count').text(0);
			}
    });
	});
});

/* 我的搭配列表 */
jQuery( document ).on( "pagebeforecreate", "#page-my-dp-list", function( e ) {
		
	var $page = jQuery(e.target);
	var page_key = 'dapei';
	var data_key = 'my.dapei';
	
	var page_url = e.target.baseURI;
	var date = jQuery.url('?date',page_url) || '';
	var scene = jQuery.url('?scene',page_url) || '';
	
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var $delete_pop = $page.find('#delete_pop');
	var $btn_add = $page.find('.js_add');

	var fix_list_imgs = function(){
		
		jQuery('.ts_dp_tpl_li').each(function(index, element) {
     	
		  var $li_root = jQuery(this);
			$li_root.find('.js_preview_c').each(function(index, element) {
        var $preview = jQuery(this);
				var $img = $preview.find('img');
				
				if($img.length){
					var p_w = $preview.width();
					var p_h = $preview.innerHeight();
					var p_m = p_w>p_h?p_w:p_h;
					
					var $img_wrap = jQuery('<span></span>').css({
						width:p_m,
						height:p_m,
						position:'absolute',
						left:'50%',
						top:'50%',
						'margin-left':-p_m/2,
						'margin-top':-p_m/2,
						overflow:'hidden',
						display:'block'
					});
					$img.width('100%').height('100%');
					$img.appendTo($img_wrap);
					$preview.empty().append($img_wrap);
				}
      });
			
			
    });
		
	}


	
	/* START DELETE action */
	$delete_pop.find('.js_ok').click(function(){
		var $from = $delete_pop.data('from_li');
		var from_id = $from.data('id');
		var from_remote_id = $from.data('remote_id');
		
		var list_da = get_o(data_key);
		delete list_da[from_id];
		set_o(data_key,list_da);
		
		build_list();
		
		sync.add(page_key,'del',from_id,from_remote_id);
		
		toast('删除成功！');
		
	});
	/* END DELETE action */
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		var list_da = get_o(data_key);
		
		if( scene ){
			for( var k in list_da ){
				if( list_da[k]['scene'] != scene ){
					delete list_da[k];
				}
			}
		}
		
		if( date ){
			for( var k in list_da ){
				if( list_da[k]['date'] != date ){
					delete list_da[k];
				}
			}
		}
		
		$list.empty();
		
		if( !is_empty(list_da) ){
			$no_data.hide();
			
			//console.log(list_da);
			
			for( k in list_da ){
				
				var imgs_cat_da = {};
				for( l in list_da[k].single_list ){
					imgs_cat_da[list_da[k].single_list[l].cat] = list_da[k].single_list[l].local_uri;
				}
				
				var a_href = "my_dp_add.html?id="+k;
				if(date){
					a_href += '&date='+date;
				}else if(scene){
					a_href += '&scene='+scene;
				}
				
				
				
				var li_html ='<div class="ts_dp_tpl ts_dp_tpl_li">'+
				' <ul class="col_1">'+
				'    <li class="i1"><span class="js_preview_c">'+(imgs_cat_da[1] ? '<img src="'+imgs_cat_da[1]+'?_='+random_string()+'">' : '上衣')+'</span><input type="hidden" class="js_local_uri" data-id="1"></li>'+
				'    <li class="i2"><span class="js_preview_c">'+(imgs_cat_da[2] ? '<img src="'+imgs_cat_da[2]+'?_='+random_string()+'">' : '裤子')+'</span><input type="hidden" class="js_local_uri" data-id="2"></li>'+
				'  </ul>'+
				'  <ul class="col_2">'+
				'    <li class="i3"><span class="js_preview_c">'+(imgs_cat_da[3] ? '<img src="'+imgs_cat_da[3]+'?_='+random_string()+'">' : '裙子')+'</span><input type="hidden" class="js_local_uri" data-id="3"></li>'+
				'    <li class="i4"><span class="js_preview_c">'+(imgs_cat_da[4] ? '<img src="'+imgs_cat_da[4]+'?_='+random_string()+'">' : '鞋子')+'</span><input type="hidden" class="js_local_uri" data-id="4"></li>'+
				'    <li class="i5"><span class="js_preview_c">'+(imgs_cat_da[5] ? '<img src="'+imgs_cat_da[5]+'?_='+random_string()+'">' : '包包')+'</span><input type="hidden" class="js_local_uri" data-id="5"></li>'+
				'    <li class="i6"><span class="js_preview_c">'+(imgs_cat_da[6] ? '<img src="'+imgs_cat_da[6]+'?_='+random_string()+'">' : '饰品')+'</span><input type="hidden" class="js_local_uri" data-id="6"></li>'+
				'    <li class="i7"><span class="js_preview_c">'+(imgs_cat_da[7] ? '<img src="'+imgs_cat_da[7]+'?_='+random_string()+'">' : '化妆品')+'</span><input type="hidden" class="js_local_uri" data-id="7"></li>'+
				'    <li class="i8"><span class="js_preview_c">'+(imgs_cat_da[8] ? '<img src="'+imgs_cat_da[8]+'?_='+random_string()+'">' : '单品')+'</span><input type="hidden" class="js_local_uri" data-id="8"></li>'+
				'  </ul>'+
				'</div>';		
				
				
				var $li = jQuery('<li data-id="'+list_da[k].id+'" data-remote_id="'+(list_da[k].remote_id || '')+'"><a  href="'+a_href+'"></a>'+li_html+'<a href="#delete_pop" data-icon="delete" data-rel="popup" data-position-to="window" data-transition="pop" class="js_delete">Delete</a></li>');
				
				
				var $del = $li.find('.js_delete');
				
				(function(){
					var _$li = $li;
					$del.click(function(){
						$delete_pop.data('from_li',_$li);
					});
				})();
				$list.append($li);
			}
			$list.show();
		}else{
			$no_data.show();
			$list.hide();
		}
		
		fix_list_imgs();
		
		init_db_data($page);
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
		
	}
	
	build_list();
	/* END build_list */
	
	
	/* START pull_remote */
	var pull_remote = function(_cb){

		var list_da = get_o(data_key);
		
		console.log('pull_remote');
		
		send_ajax(page_key+'.list',{},function(data){
			if( data.status ){
				list_da = {};
				if( data.data.total_count > 0 ){
					for( var i=0; i<data.data.content.length; i++ ){
						var cur_i = data.data.content[i];
						
						console.log(cur_i);
						
						var local_id = random_string();
						var local_obj = JSON.parse(cur_i.description);
						
						local_obj.id = local_id;
						local_obj.is_sync = false;
						local_obj.remote_id = cur_i.id;
						local_obj.name = cur_i.name;
						//local_obj.remote_uri = cur_i.img;
						//local_obj.local_uri_1 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_2 = 'images/thumb_default@2x.png';
						//local_obj.local_uri_3 = 'images/thumb_default@2x.png';
						
						
						list_da[local_id] = local_obj;
					}
				}
				set_o(data_key,list_da);
				build_list();
			}else{
				toast('同步失败，请稍候重试。');
			}
			
			_cb();
		},function(){
			_cb();
		})
		
	}
	/* END pull_remote */
	
	
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
	
		pull_remote(function(){
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		setTimeout( function(){
			iScroll.refresh();
		} , 400);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[page_key]){
		pull_remote(function(){
			data_init[page_key] = true;
		});
	}
	


	$page.on('pagebeforeshow',function(e){
		
		var $page = jQuery(e.target);
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var date = jQuery.url('?date',page_url) || '';
		var scene = jQuery.url('?scene',page_url) || '';
		
		if(date){
			$btn_add.attr('href','my_dp_add.html?date='+date);
		}else if(scene){
			$btn_add.attr('href','my_dp_add.html?scene='+scene);
		}
	})
});

/* 我的搭配列表->添加 */
jQuery( document ).on( "pagebeforecreate", "#page-my-dp-add", function( e ) {
  var $page = jQuery(e.target);
	var page_key = 'dapei';
	var data_key = 'my.dapei';
	
	var $id = $page.find('.js_id');
	var $date = $page.find('.js_date');
	var $scene = $page.find('.js_scene');
	
	var $btn_save = $page.find('.js_save');
	var $btn_back = $page.find('.js_back');
	
	var $preview_btn = $page.find('.js_preview_c');
	//$preview_btn.click()
	
	var page_url = e.target.baseURI;
	var date = jQuery.url('?date',page_url) || '';
	var scene = jQuery.url('?scene',page_url) || '';	
	
	$btn_save.click(function(){
		var id = jQuery.trim($id.val());
		
		var $li_choosen = $page.find('.ts_dp_tpl li.choosen');
		
		if( $li_choosen.length <2 ){
			toast('您至少需要选择两件单品。');
		}else{
			
			var single_list = {};
			
			$li_choosen.each(function(){
				var $this = jQuery(this);
				var sid = $this.data('id');
				var local_uri = $this.data('local_uri');
				var cat = $this.data('cat');
				var name = $this.data('name');
				single_list[sid]={
					'id':sid,
					'local_uri':local_uri,
					'cat':cat,
					'name':name
				}
			})
			
			var list_da = get_o(data_key);
			
			var mode = 'edit';
			if ( !id ){
				mode = 'add';
				id = random_string();
				list_da[id]={};
			}
			
			list_da[id].id=id;
			list_da[id].single_list=single_list;
			list_da[id].date=date;
			list_da[id].scene=scene;
			
			set_o(data_key,list_da);
			
			sync.add(page_key,mode,id);
			
			toast('保存成功！');
			
			if(date){
				jQuery.mobile.changePage('my_dp_list.html?date='+date,{reloadPage:true,reverse:true});
				console.log('change to date');
			}else if(scene){
				jQuery.mobile.changePage('my_dp_list.html?scene='+scene,{reloadPage:true,reverse:true});
				console.log('change to scene');
			}
			
			set_s('tmp.my_dp.single_add_list',null);
			
		}
		
		
	});
	
	
	$page.on("pageshow",function(e){
		var $page = jQuery(e.target);
		
		var $id = $page.find('.js_id');
		
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var date = jQuery.url('?date',page_url) || '';
		var scene = jQuery.url('?scene',page_url) || '';		
		var id = jQuery.url('?id',page_url) || '';
		
		console.log(page_url);
		
		if( id ){
			var key = 'my.dapei';
			var list_da =  get_o(key);
			if( typeof list_da[id] == 'object' ){
				
				var tmp_da = []
				for( var k in list_da[id].single_list ){
					tmp_da.push(list_da[id].single_list[k]);
				}
				set_o('tmp.my_dp.single_add_list',tmp_da);
			}
		}
		$id.val(id);
	
		var refill_data = function(){
			var choose_list = get_o('tmp.my_dp.single_add_list');
			if( !choose_list ) return;
			
			$page.find('.ts_dp_tpl li').removeClass('choosen');
			
			for( var i=0;i<choose_list.length;i++ ){
				var cat = choose_list[i].cat;
				var local_uri = choose_list[i].local_uri;
				var name = choose_list[i].name;
				var id = choose_list[i].id;
				
				var $li = $page.find('.ts_dp_tpl .i'+cat);
				$li.data('id',id);
				$li.data('local_uri',local_uri);
				$li.data('cat',cat);
				$li.data('name',name);
				$li.addClass('choosen');
				var $preview = $li.find('.js_preview_c');
				var $thumb = $li.find('.js_local_uri');
				$thumb.val(local_uri);
				var p_w = $preview.width();
				var p_h = $preview.innerHeight();
				var p_m = p_w>p_h?p_w:p_h;
				var $img_wrap = jQuery('<span></span>').css({
					width:p_m,
					height:p_m,
					position:'absolute',
					left:'50%',
					top:'50%',
					'margin-left':-p_m/2,
					'margin-top':-p_m/2,
					overflow:'hidden',
					display:'block'
				});
				var $img = jQuery('<img src="'+local_uri+'?_='+random_string()+'" width="100%" height="100%">');
				$img_wrap.append($img);
				$preview.empty().append($img_wrap);
				
			}
		}
		
		refill_data();
		
		$body = jQuery('body');
		var choose_data = $body.data('my.dp.single.choose');
		if( choose_data ){
			var tmp_list = get_o('tmp.my_dp.single_add_list');
			tmp_list = ( tmp_list instanceof Array )?tmp_list:[];
			tmp_list.push(choose_data);
			set_o('tmp.my_dp.single_add_list',tmp_list);
			refill_data();
			$body.data('my.dp.single.choose',null);
		}
		
		if(date){
			$btn_back.attr('href','my_dp_list.html?date='+date);
			$preview_btn.each(function(index, element) {
        var $this = jQuery(this);
				var href = $this.attr('href');
				var pos = url('?pos',href);
				$this.attr('href','my_dp_single.html?id='+id+'&pos='+pos+'&date='+date);
      });
		}else if(scene){
			$btn_back.attr('href','my_dp_list.html?scene='+scene);
			$preview_btn.each(function(index, element) {
        var $this = jQuery(this);
				var href = $this.attr('href');
				var pos = url('?pos',href);
				$this.attr('href','my_dp_single.html?id='+id+'&pos='+pos+'&scene='+scene);
      });
		}	
	
	
	});
	
})

/* 我的搭配 －》单品列表 */
jQuery( document ).on( "pagebeforecreate", "#page-my-dp-single", function( e ) {
  var $page = jQuery(e.target);
	
	var page_url = e.target.baseURI;
	var id = jQuery.url('?id',page_url) || '';
	var pos = jQuery.url('?pos',page_url) || '';
	
	var full_da = get_o('my.single');
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	var child_da = get_o('my.single');
	
	$btn_back = $page.find('.js_back');

	var page_url = e.target.baseURI;
	var date = jQuery.url('?date',page_url) || '';
	var scene = jQuery.url('?scene',page_url) || '';

	var list_da = full_da; 
	if( pos ){
		list_da = {};
		for( var k in full_da ){
			if( full_da[k]['cat'] == pos ){
				list_da[k]=full_da[k];
			}
		}
	}
	
	var create_list = function(){
		
		$list.empty();
		if( !is_empty(list_da) ){
			$no_data.hide();
			for( k in list_da ){
				
				var cat_count = 0;
				for( var k2 in child_da ){
					if( child_da[k2]['cat_yc'] == k ){
						cat_count++;
					}
				}
				
				var $li = jQuery('<li data-id="'+list_da[k].id+'"><a href="javascript:;"><img src="'+list_da[k].local_uri_1+'" width="80" height="80"><h2>'+list_da[k].name+'</h2></a> </li>');
				(function(){
					var _$li = $li;
					_$li.click(function(){
						var obj={};
						obj.id = _$li.data('id');
						obj.local_uri = _$li.find('img').attr('src');
						obj.name = _$li.find('h2').text();
						obj.cat = pos;
						
						jQuery('body').data('my.dp.single.choose',obj);
						if( date ){
							jQuery.mobile.changePage('my_dp_add.html?date='+date+'&id='+id,{reloadPage:true,reverse:true});
						}else if(scene){
							jQuery.mobile.changePage('my_dp_add.html?scene='+scene+'&id='+id,{reloadPage:true,reverse:true});
						}
					})
				})();
				$list.append($li);
			}
		}else{
			$no_data.show();
			$list.hide();		
		}
	}
	
	create_list();
	
	$page.on("pagebeforeshow",function(e){
		
		var $page = jQuery(e.target);
		var page_url = jQuery.mobile.activePage[0].baseURI;
		var date = jQuery.url('?date',page_url) || '';
		var scene = jQuery.url('?scene',page_url) || '';
		
		console.log(page_url);
		
		if(date){
			$btn_back.attr('href','my_dp_add.html?date='+date+'&id='+id);
		}else if(scene){
			$btn_back.attr('href','my_dp_add.html?scene='+scene+'&id='+id);
		}	
	});
	
})

/* 求搭 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yw-da", function( e ) {
  var $page = jQuery(e.target);
	var api_key = 'content';
	var api_type = 1;
	
	var $photo_uri = $page.find('.js_photo_uri_2');
	var $content = $page.find('.js_content');
	var $btn_save = $page.find('.js_save');
	
	init_photo_add_list($page);
	
	$btn_save.click(function(){
		var photo_uri = $photo_uri.val();
		var content = $content.val();
		
		if( photo_uri && content ){
			
			send_ajax( api_key+'.create',{
				name:get_s('cur_user_id'),
				description:content,
				type:api_type
			},function(data){
				console.log(data);
				if(data.status){
					upload_img(photo_uri,data.data,1,function(remote_uri){
						toast('您的求搭已提交成功！');
						$content.val('');
						$photo_uri.val('');
						jQuery.mobile.changePage('my_yw.html',{reloadPage:true,reverse:true});
					},function(){
						toast('图片上传失败，请稍候再试。');
					})
				}else{
					
				}
			},function(){
				
			} )
			
		}else{
			toast('你必须选择一张图片并留言。');
			return false;
		}
	});
});

/* 求赞 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yw-zan", function( e ) {
  var $page = jQuery(e.target);
	var api_key = 'content';
	var api_type = 2;
	
	var $photo_uri = $page.find('.js_photo_uri_2');
	var $content = $page.find('.js_content');
	var $btn_save = $page.find('.js_save');
	
	init_photo_add_list($page);
	
	$btn_save.click(function(){
		var photo_uri = $photo_uri.val();
		var content = $content.val();
		
		if( photo_uri && content ){
			
			send_ajax( api_key+'.create',{
				name:get_s('cur_user_id'),
				description:content,
				type:api_type
			},function(data){
				console.log(data);
				if(data.status){
					upload_img(photo_uri,data.data,1,function(remote_uri){
						toast('您的求赞已提交成功！');
						$content.val('');
						$photo_uri.val('');
						jQuery.mobile.changePage('my_yw.html',{reloadPage:true,reverse:true});
					},function(){
						toast('图片上传失败，请稍候再试。');
					})
				}else{
					
				}
			},function(){
				
			} )
			
		}else{
			toast('你必须选择一张图片并留言。');
			return false;
		}
	});
	
});

/* 求推荐 */
jQuery( document ).on( "pagebeforecreate", "#page-my-yw-tuijian", function( e ) {
  var $page = jQuery(e.target);
	var api_key = 'content';
	var api_type = 3;
	
	var $content = $page.find('.js_content');
	var $btn_save = $page.find('.js_save');
	
	$btn_save.click(function(){
		var content = $content.val();
		
		if( content ){
			send_ajax( api_key+'.create',{
				name:get_s('cur_user_id'),
				description:content,
				type:api_type
			},function(data){
				toast('您的求推荐已提交成功！');
				$content.val('');
				jQuery.mobile.changePage('my_yw.html',{reloadPage:true,reverse:true});
			},function(){
				
			} )
		}else{
			toast('请填写留言。');
			return false;
		}
	});
	
});

/* 衣橱晒晒 */
jQuery( document ).on( "pagebeforecreate", "#page-sq-yc", function( e ) {
  var $page = jQuery(e.target);
	var api_key = 'content';
	var api_type = 0;
	
	var cur_page_idx,max_page_idx;
	
	var $list = $page.find('.js_list').empty();
	var $no_data = $page.find('.js_nodata');
	
	var append_item = function( obj ){
		
		console.log(obj)
		
		var type_name = '衣橱';
		var img_html = '	<div class="p"><img src="'+make_img_url(obj.id,1)+'" alt="" /></div>';
		switch(obj.type){
			case '1':
				type_name = '求搭';
				break;
			case '2':
				type_name = '求咱';
				break;
			case '3':
				type_name = '求推荐';
				img_html = '';
				break;
		}
		
		var li_html = '<div class="li" data-id="'+obj.id+'">'+
		'	<div class="t"><span class="l">'+(obj.creator_name||'')+' 的'+type_name+'</span> <span class="r">'+(obj.time||'')+'</span></div>'+
		img_html+
		'	<div class="c">'+obj.description+'</div>'+
		'	<div class="i">'+
		'		<span>喜欢：'+(obj.like||0)+'</span><span>评论：'+(obj.comment||0)+'</span><span>转采：'+(obj.share||0)+'</span>'+
		'	</div>'+
		'</div>';
		
		var $li = jQuery(li_html);
		
		$li.click(function(){
			var id = jQuery(this).data('id');
			jQuery.mobile.changePage('sq_yc_detail.html?id='+id,{reloadPage:true});
		});
		
		$li.appendTo($list);
	}
	
	
	$page.find('.fix_menu').each(function(index, element) {
    var $root = jQuery(this);
		var $trigger = $root.find('h3');
		var $opts = $root.find('ul li');
		var $input = $root.find('input');
		
		$trigger.click(function(){
			if($root.is('.open')){
				$root.removeClass('open');
			}else{
				$root.addClass('open');
			}
		});
		
		$opts.click(function(){
			$input.val(jQuery(this).data('val'));
			$trigger.text(jQuery(this).text());
			$root.removeClass('open');
			pull_down_action();
		});
		
		
  });
	
	
	
	/* START pull_remote */
	var pull_remote = function(page_idx,_cb){
		cur_page_idx = page_idx;
		
		send_ajax(api_key+'.list',{
				page:page_idx,
				size:10,
				type:$page.find('input[name=type]').val()
			},function(data){
			if( data.status ){
				max_page_idx = data.data.total_page;
				_cb(data.data);
			}else{
				toast('更新失败，请稍候再试。');
				_cb(null);
			}
		},function(){
			_cb(null);
		})
		
	}
	/* END pull_remote */
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
		pull_remote(1,function(data){
			$list.empty();
			
			if( data.content.length > 0 ){
				$no_data.hide();
				$list.show();
				for( var i=0;i<data.content.length;i++ ){
					append_item( data.content[i] );
				}
			}else{
				$no_data.show();
				$list.hide();
			}


			setTimeout( function(){
				iScroll.refresh();
			} , 400);
			
			_cb_done();
		});
	}
	
	var pull_up_action = function(_cb_done){
		
		if( cur_page_idx < max_page_idx ){
			
			pull_remote(cur_page_idx+1,function(data){
				
				if( data.content.length > 0 ){
					for( var i=0;i<data.content.length;i++ ){
						append_item( data.content[i] );
					}
				}
				
				setTimeout( function(){
					iScroll.refresh();
				} , 400);
				
				_cb_done();
			});			
			
		}
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		pull_down_action(function(){});
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[api_key]){
		pull_down_action(function(){
			data_init[api_key] = true;
		});
	}
});

/* 衣橱晒晒 -> 详情 */
jQuery( document ).on( "pagebeforecreate", "#page-sq-yc-detail", function( e ) {
  var $page = jQuery(e.target);
	var api_key = 'content';
	var api_type = 0;
	
	var $list = $page.find('.js_list').empty();
	var page_url = e.target.baseURI;
	var id = jQuery.url('?id',page_url) || '';
	
	var $btn_comment = $page.find('.js_comment');
	
	$btn_comment.click(function(){
		var id = $page.data('id');
		jQuery.mobile.changePage( 'sq_yc_comment.html?id='+id,{reloadPage:true} );
	});
	
	var update_content = function(_cb){
		
		var page_url = e.target.baseURI;
		var id = jQuery.url('?id',page_url) || '';	
		
		send_ajax(api_key+'.detail',{'id':id},function(data){
			var obj = data.data;
			
			var type_name = '衣橱';
			var img_html = '	<div class="p"><img src="'+make_img_url(obj.id,1)+'" alt="" /></div>';
			switch(obj.type){
				case '1':
					type_name = '求搭';
					break;
				case '2':
					type_name = '求咱';
					break;
				case '3':
					type_name = '求推荐';
					img_html = '';
					break;
			}
			
			var li_html = '<div class="li" data-id="'+obj.id+'">'+
			'	<div class="t"><span class="l">'+(obj.creator_name||'')+' 的'+type_name+'</span> <span class="r">'+(obj.time||'')+'</span></div>'+
			img_html+
			'	<div class="c">'+obj.description+'</div>'+
			'	<div class="i">'+
			'		<span>喜欢：'+(obj.like||0)+'</span><span>评论：'+(obj.comment||0)+'</span><span>转采：'+(obj.share||0)+'</span>'+
			'	</div>'+
			'<div class="comments js_comment_list"></div>'+
			'</div>';
			
			var $li = jQuery(li_html);
			
			$list.empty();
			$li.appendTo($list);			
			
			var $comment_list = $li.find('.js_comment_list');
			
			send_ajax( 'comment.list',{ target:obj.id },function(data){
				$comment_list.empty();
				
				console.log(data);
				
				
				for( var i=0; i<data.data.content.length; i++ ){
					
					var obj = data.data.content[i];
					var ci_html = '<div class="ci">'+
					'	<div class="ct"><img src="images/thumb_default@2x.png" width="40" height="40" alt="" /></div>'+
					'	<div class="cc">'+
					'  	<div class="tit">'+
					'    	<span class="name">'+obj.creator_name+'</span>'+
					'      <span class="time">'+obj.create_time+'</span>'+
					'    </div>'+
					'    <div class="ccon">'+obj.description+'</div>'+
					'  </div>'+
					'</div>';
					
					jQuery(ci_html).appendTo($comment_list);
					
					
				}
				
				
				setTimeout( function(){
					iScroll.refresh();
				} , 400);
				
				_cb();
			} )
			
			
		});
		
	}
	
	/* START iScroll Settings */
	var iScroll;
	
	var pull_down_action = function(_cb_done){
		update_content(function(){
			_cb_done();
		})
	}
	
	var pull_up_action = function(_cb_done){
		_cb_done();
	}
	
	
	$page.on('pagecreate',function(){
		iScroll = init_iscroll($page,function(){
			var iscroll = this;
			pull_down_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		},function(){
			var iscroll = this;
			pull_up_action.apply(iscroll,[function(){
				iscroll.refresh();
			}]);
		})[0];
	})
	
	
	$page.on('pageshow',function(){
		pull_down_action(function(){});
		var page_url = e.target.baseURI;
		var id = jQuery.url('?id',page_url) || '';	
		$page.data('id',id);
	})
	/* END iScroll Settings */
	
	
	//init pull
	if(!data_init[api_key]){
		pull_down_action(function(){
			data_init[api_key] = true;
		});
	}
});

/* 衣橱晒晒 -> 详情 ->评论 */
jQuery( document ).on( "pagebeforecreate", "#page-sq-yc-comment", function( e ) {

	var $page = jQuery(e.target);
	var api_key = 'comment';

	var page_url = e.target.baseURI;
	var id = jQuery.url('?id',page_url) || '';	

	var $photo_uri = $page.find('.js_photo_uri_2');
	var $content = $page.find('.js_content');
	var $btn_save = $page.find('.js_save');
	
	var $btn_back = $page.find('.js_back');
	$btn_back.click(function(){
		jQuery.mobile.changePage('sq_yc_detail.html?id='+id,{reloadPage:true,reverse:true});
		return false;
	});	
	
	
	init_photo_add_list($page);
	
	$btn_save.click(function(){
		var photo_uri = $photo_uri.val();
		var content = $content.val();
		
		if( photo_uri && content ){
			
			send_ajax( api_key+'.create',{
				name:get_s('cur_user_id'),
				description:content,
				target:id
			},function(data){
				console.log(data);
				if(data.status){
					upload_img(photo_uri,data.data,1,function(remote_uri){
						toast('您的评论已提交成功！');
						$content.val('');
						$photo_uri.val('');
						jQuery.mobile.changePage('sq_yc_detail.html?id='+id,{reloadPage:true,reverse:true});
					},function(){
						toast('图片上传失败，请稍候再试。');
					})
				}else{
					
				}
			},function(){
				
			} )
			
		}else{
			toast('你必须选择一张图片并留言。');
			return false;
		}
	});
	
});


/* 关注 -> 我关注的 */
jQuery( document ).on( "pagebeforecreate", "#page-my-gz-follow", function( e ) {
  var $page = jQuery(e.target);
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		
		$list.empty();
		
		send_ajax('user.follow',{},function(data){
			$list.empty();
			
			if( data.data.content.length > 0 ){
				for( var i=0; i<data.data.content.length; i++ ){
					var obj = data.data.content[i];
					var $li = jQuery('<li><a href="#">'+
        	'<img src="images/thumb_default@2x.png">'+
        	'<h2>'+obj.name+'</h2>'+
        	'</a>'+
    			'</li>');
					
					$li.appendTo($list);
					$list.listview( "refresh" );
				}
				$list.show();
				$no_data.hide();
			}else{
				$list.hide();
				$no_data.show();
			}
		})
		
		
		
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
});


/* 关注 -> 关注我的 */
jQuery( document ).on( "pagebeforecreate", "#page-my-gz-followed", function( e ) {
  var $page = jQuery(e.target);
	var $list = $page.find('.js_list');
	var $no_data = $page.find('.js_nodata');
	
	/* START build_list */
	var first_init = true;
	
	var build_list = function(){
		
		$list.empty();
		
		send_ajax('user.followed',{},function(data){
			$list.empty();
			
			if( data.data.content.length > 0 ){
				for( var i=0; i<data.data.content.length; i++ ){
					var obj = data.data.content[i];
					var $li = jQuery('<li><a href="#">'+
        	'<img src="images/thumb_default@2x.png">'+
        	'<h2>'+obj.name+'</h2>'+
        	'</a>'+
    			'</li>');
					
					$li.appendTo($list);
					$list.listview( "refresh" );
				}
				$list.show();
				$no_data.hide();
			}else{
				$list.hide();
				$no_data.show();
			}
		})
		
		
		
		
		if( first_init ){
			first_init = false;
		}else{
			$list.listview( "refresh" );
		}
	}
	
	build_list();
	/* END build_list */
	
});

