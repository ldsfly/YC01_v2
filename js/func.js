// JavaScript Document

function get_s(key){
	return window.localStorage.getItem(key);
}

function set_s(key,value){
	return window.localStorage.setItem(key,value);
}

function get_o(key){
	return JSON.parse(get_s(key));
}

function set_o(key,value){
	return set_s(key,JSON.stringify(value));
}

function make_img_url(id,i,_suffix){
	suffix = _suffix || '.jpg';
	return IMG_ROOT + id + '/' + id+'_'+i+suffix;
}

(function(){
	
	window.save_img_to_local = function( img_uri, callback ){
		photoSave(img_uri, callback);
	}
	
	var photoSave = function(imageURI, callback) {
		// this relies on knowledge of photo file URI - you might want to make this more robust: -)
		var imgFileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		var suffix = imgFileName.substr(imgFileName.lastIndexOf('.'));
		var new_name = random_string(32) + suffix;
		
		var gotFileEntry = function (fileEntry) {
			//toast("got image file entry: " + fileEntry.fullPath);
			var gotFileSystem = function (fileSystem) {
				// copy the file 
				fileEntry.copyTo(fileSystem.root, new_name, function(fileEntry){
					//toast("copied file: " + fileEntry.toURI());
					callback(fileEntry.toURL());
				}, fsFail);
			};
			// get file system to copy or move image file to 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, fsFail);
		};
		//resolve file system for image 
		//(image is currently stored in dir off of persistent file system but that may change)
		window.resolveLocalFileSystemURI(imageURI, gotFileEntry, fsFail);
	}
	
	// file system fail 
	var fsFail = function(error) {
		//toast("failed with error code: " + error.code);
	};
	
	// camera fail 
	var onFail = function(message) {
		//toast('Failed because: ' + message);
	}
	
})();



(function(){
	
	window.download_img_to_local = function( img_uri, callback ){
		download_save(img_uri, callback);
	}
	
	var fail = function(error) {
		console.log(error);
	};
		
	var get_fs_p_root = function (_cb) {
		
		if (!window._fs_p_root) {
			window.requestFileSystem(
				LocalFileSystem.PERSISTENT, 0,
				function onFileSystemSuccess(fileSystem) {
					window._fs_p_root = fileSystem.root.fullPath+'/';
					_cb(window._fs_p_root);
					},
					fail
				);
		} else {
			_cb(window._fs_p_root);
		}
	}
	
	var download_save = function(imageURI, callback) {
		// this relies on knowledge of photo file URI - you might want to make this more robust: -)
		var imgFileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		var suffix = imgFileName.substr(imgFileName.lastIndexOf('.'));
		//var new_name = random_string(32) + suffix;
		var new_name = imgFileName;
		
		//console.log('imgFileName: ' + imgFileName);
		//console.log('suffix: ' + suffix);
		//console.log('new_name: ' + new_name);
		
		get_fs_p_root(function(sPath){
			var new_path = sPath + new_name;
			//console.log(new_path);
			
			var tf = new FileTransfer();
			
			tf.download(
					imageURI,
					new_path,
					function (theFile) {
						callback(theFile.toURL());
					},
					function(){
						callback('');
					}
			);
		});
	}
	
})();


function init_photo_add_list($page){
	var sel = '.js_photo_add_list';
	
	jQuery(sel).each(function(index, element) {
    var $root = jQuery(this);
		if( $root.data(sel+'_inited') ) return false;
				
		var $add_photo_c = {};
		var $add_photo_a = {};
		var $photo_preview = {};
		var $photo_uri = {};
		var $upload_pop = {};
		
		for( var i=1;i<=3;i++ ){
			
			$add_photo_c[i] = $page.find('.js_add_photo_c_'+i);
			$add_photo_a[i] = $page.find('.js_add_photo_a_'+i);
			$photo_preview[i] = $page.find('.js_photo_preview_'+i);
			$photo_uri[i] = $page.find('.js_photo_uri_'+i);
			$upload_pop[i] = $page.find('.js_upload_pop_'+i);
			
			if( $add_photo_c[i] && $add_photo_a[i] && $photo_preview[i] && $photo_uri[i] && $upload_pop[i] ){
				
				(function(){
					var _i=i;
					$add_photo_c[_i].click(function(){
						$upload_pop[_i].popup('close');
						navigator.camera.getPicture( function(image_uri){
							save_img_to_local(image_uri,function(local_img_uri){
								//toast(local_img_uri);
								$photo_preview[_i].attr('src',local_img_uri);
								$photo_uri[_i].val(local_img_uri);
							});
						}, function(){
							//console.log('photo fail');
						}, { 
							quality : 75,
							destinationType : Camera.DestinationType.FILE_URI,
							sourceType : Camera.PictureSourceType.Camera,
							allowEdit : true,
							encodingType: Camera.EncodingType.JPEG,
							targetWidth: 500,
							targetHeight: 500,
							saveToPhotoAlbum: false
						});
					});
				})();
				
	
				(function(){
					var _i=i;
					$add_photo_a[_i].click(function(){
						$upload_pop[_i].popup('close');
						navigator.camera.getPicture( function(image_uri){
							save_img_to_local(image_uri,function(local_img_uri){
								//toast(local_img_uri);
								$photo_preview[_i].attr('src',local_img_uri);
								$photo_uri[_i].val(local_img_uri);
							});
						}, function(){
							//console.log('photo fail');
						}, { 
							quality : 75,
							destinationType : Camera.DestinationType.FILE_URI,
							sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
							allowEdit : true,
							encodingType: Camera.EncodingType.JPEG,
							targetWidth: 500,
							targetHeight: 500,
							saveToPhotoAlbum: false
						});
					});					
				})();
			}
		}
		
		$root.data(sel+'_inited',true);
  });
	
}



function save_db_data($page,_cb){
	var cb = _cb || null;
	var ro = {};
	$page.find('.js_db').each(function(){
		var $item = jQuery(this);
		var name = $item.attr('name');
		var m = /^(.*?)\[\]$/.exec(name);
		
		if( m && m[1] ){
			if( ro[m[1]] instanceof Array ){
				ro[m[1]].push($item.val());
			}else{
				ro[m[1]] = [$item.val()];
			}
		}else{
			ro[name]=$item.val();
		}
	});
	
	if( window.localStorage ){
		for( var k in ro ){
			window.localStorage.setItem(k,ro[k]);
		}
	}
	
	if( typeof cb == 'function' ){
		cb.apply($page);
	}
}

function init_db_data($page){
	$page.find('.js_db').each(function(){
		var $item = jQuery(this);
		var name = $item.attr('name');
		var db = $item.data('db');
		var dbh = $item.data('dbh');
		var val_name = window.localStorage.getItem(name);
		var val_db = window.localStorage.getItem(db);
		var val_dbh = window.localStorage.getItem(dbh);
		if( val_name ){
			$item.val(val_name);
		}else if( val_db ){
			$item.text(val_db);
		}else if( val_dbh ){
			$item.html(val_dbh);
		}
	});
}





window.upload_img = function(_img_uri,id,index,_cb,_cbe){
	var ft = new FileTransfer();
	
	var imgFileName = _img_uri.substr(_img_uri.lastIndexOf('/') + 1);
	var suffix = imgFileName.substr(imgFileName.lastIndexOf('.'));
	var upload_file_name = id+'_'+index+suffix;
	
	var ft_options = new FileUploadOptions();
	ft_options.fileKey = "file";
	//ft_options.fileName = _img_uri.substr(_img_uri.lastIndexOf('/') + 1);
	ft_options.fileName = upload_file_name;
	ft_options.mimeType = "text/plain";
	
	//toast('start_upload ' + ' id ' + id + _img_uri);
	ft.upload(_img_uri, encodeURI(AJAX_ROOT+"?func=file.upload&id="+id+"&type=image"), function(r){
		//toast('result:'+r.response);
		try{
			var json = jQuery.parseJSON(r.response);
			//toast('json ' + JSON.stringify(json));
			_cb(json.url);
		}catch(e){
			toast('上传失败，请重试。code=1');
			//toast(e);
			_cbe(e);
		}
	}, function(error){
		//toast('er='+error);
		toast('上传失败，请重试。code=2');
		_cbe(e);
		//toast("Code = " + error.code);
    //console.log("source " + error.source);
    //console.log("target " + error.target);
	},ft_options);
	
}

window.send_ajax = function( func,data,callback,callback_e ){
	jQuery.mobile.loading('show');

	var req = $.ajax({
			url : AJAX_ROOT+'?func='+func+'&callback=?',
			data : data,
			dataType : "jsonp",
			timeout : 10000
	});
	
	req.success(function(data) {
		//console.log('ajax success!');
		//console.log(data);
		jQuery.mobile.loading('hide');
		callback(data);
	});
	
	req.error(function(e) {
		//console.log('ajax error');
		jQuery.mobile.loading('hide');
		if( typeof callback_e == 'function' ){
			callback_e(e);
		}
	});

}

window.tick_version = function(key){
	var time = new Date().Format("yyyy-MM-dd hh:mm:ss");
	set_s(key+'_ver',time);
}

window.get_version = function(key){
	return get_s(key+'_ver') || '';
}

window.sync_user_data = function( _cb,_cbe ){
	var cb = _cb || function(){};
	var cbe = _cbe|| function(){};
	
	send_ajax('user.current',{},function(data){
		
		if( data.status ){
			
			var s_ver = data.data.last_operation;
			var u_ver = get_version('user');
			
			console.log( s_ver );
			console.log( u_ver );
			
			if( s_ver > u_ver ){
				
				//console.log('服务器比较新');
				
				set_s('my.settings.size.breast',data.data.chest);
				set_s('my.settings.size.height',data.data.height);
				set_s('my.settings.size.hips',data.data.hip);
				set_s('my.settings.size.waist',data.data.waist);
				set_s('my.settings.size.weight',data.data.weight);
				set_s('my.settings.point',data.data.score);
				set_s('user_ver',s_ver);
				cb();
				
			}else if( s_ver < u_ver ){
				
				//console.log('本地比较新');
				
				send_ajax('user.edit',{
					'details':JSON.stringify({
						'id':get_s('cur_user_id'),
						'values':{
							'chest':get_s('my.settings.size.breast'),
							'height':get_s('my.settings.size.height'),
							'hip':get_s('my.settings.size.hips'),
							'waist':get_s('my.settings.size.waist'),
							'weight':get_s('my.settings.size.weight')
						}
					})
				},function(){
					send_ajax('user.current',{},function(data){
						//console.log(data.data.last_operation);
						set_s('user_ver',data.data.last_operation);
						cb();
					},function(e){
						cbe(e)
					});
				},function(e){
					cbe(e)
				})
			}
		}
	},function(e){
		cbe(e)
	})
}


window.login = function( username,password,_cb_success,_cb_fail ){
	if (typeof _cb_success != 'function'){
		_cb_success = function(){};
	}
	if (typeof _cb_fail != 'function'){
		_cb_fail = function(){};
	}
	
	if( username && password ){
		send_ajax( 'user.login',{
			'name':username,
			'password':password
		},function(data){
			if( data.status ){
				set_s('u_username',username);
				set_s('u_password',password);
				
				send_ajax('user.current',{},function(data){
					var cur_user_id = get_s('cur_user_id');
					
					if( cur_user_id!=data.data.id ){
						console.log( cur_user_id+'!='+data.data.id+' clear data' );
						clear_data();
					}
					
					console.log(data);
					
					try{
					
					var list_da = get_o('my.settings.account');
					
					if( !list_da ){
						list_da={};
					}
					if( !list_da[data.data.id] ){
						list_da[data.data.id] = {};
					}
					list_da[data.data.id].id = data.data.id;
					list_da[data.data.id].username = username;
					list_da[data.data.id].password = password;
					list_da[data.data.id].email = data.data.email || '';
					list_da[data.data.id].avatar = data.data.avatar || '';
					set_o('my.settings.account',list_da);
					set_s('cur_user_id',data.data.id);
					
					jQuery.mobile.changePage('home.html',{reloadPage:true})
					
					toast('登录成功，欢迎回来！');
					console.log('登录成功，欢迎回来！');
					_cb_success(data.data);
					
					}catch(e){
						
					console.log(e);	
					}
				},function(){
					toast('访问失败，请检查网络。');
					_cb_fail();
				})
			}else{
				switch(data.error.description){
					case 'wrong_username_or_password':
						toast('错误的用户名或密码。');
						break;
				}
				_cb_fail();
			}
		},function(){
			if( ls_username && ls_password ){
				toast('自动登录失败，<br>您将以离线模式浏览。');
			}else{
				toast('登录失败，请检查网络。');
			}
			_cb_fail();
		});
	}else{
		toast('请输入用户名和密码。');
		_cb_fail();
	}
}


window.clear_data = function(){
	var recover_oa = {};
	var recover_sa = {};
	
	recover_oa['my.settings.account'] = get_o('my.settings.account');
	recover_oa['my.yichu'] = get_o('my.yichu');
	
	recover_sa['u_username'] = get_s('u_username');
	recover_sa['u_password'] = get_s('u_password');
	
	window.localStorage.clear();
	
	for( var k in recover_oa ){
		set_o( k,recover_oa[k] );
	}
	
	for( var k in recover_sa ){
		set_s( k,recover_sa[k] );
	}
}

