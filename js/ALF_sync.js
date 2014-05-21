


function ALF_sync(){
	this.init();
}

ALF_sync.prototype.init = function(){
	this.key = 'system.sync_list';
	this.in_sync = false;
}

//action == add|del|edit
ALF_sync.prototype.add = function( type,action,id,_remote_id ){
	var _this = this;
	var list = get_o(_this.key) || [];
	var remote_id = _remote_id || 0;
	
	//如果是删除动作，则删除list中的对该对象的其他动作，只保留删除动作。
	if( action == 'del' ){
		for( var i=0;i<list.length;i++ ){
			if( list[i].type == type && list[i].id == id ){
				list.splice(i,1);
			}
		}
	}
	
	if( action == 'edit' ){
		for( var i=0;i<list.length;i++ ){
			if( list[i].action == 'edit' && list[i].type == type && list[i].id == id ){
				list.splice(i,1);
			}
		}
	}
	
	list.push({
		'type':type,
		'action':action,
		'id':id,
		'remote_id':remote_id
	});
	set_o(this.key,list);
	
	if( !_this.in_sync ){
		_this.start();
	}
	
}

ALF_sync.prototype.show_loading = function(){
	var _this = this;
	jQuery('.js_dot_loading').show();
	_this.in_sync = true;
}

ALF_sync.prototype.hide_loading = function(){
	var _this = this;
	jQuery('.js_dot_loading').hide();
	_this.in_sync = false;
}

//type = user|brand|color|tag
ALF_sync.prototype.start = function(){
	var _this = this;
	var list = get_o(_this.key);
	
	console.log(list);
	
	_this.show_loading();
	if( list.length ){
		var sync_item = list[0];
		
		try{
			eval( '_this.sync_'+sync_item.type+'(sync_item);' );
		}catch(e){
			list.shift();
			set_o(_this.key,list);
			_this.start();
		};
		
	}else{
		_this.hide_loading();
	}
}

/* 用户信息 */
ALF_sync.prototype.sync_user = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	
	sync_user_data(function(){
		list.shift();
		set_o(_this.key,list);
		_this.start();
	},function(){
		_this.hide_loading();
	});
};

/* 品牌 */
ALF_sync.prototype.sync_brand = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	var page_key = 'brand';
	var api_key = 'brand';
	var data_key = 'my.settings.'+page_key;
	var obj_list = get_o(data_key);
	var cur_obj = obj_list[obj.id];
	
	if( cur_obj || obj.remote_id ){
		
		switch( obj.action ){
			case 'add':
				send_ajax(api_key+'.create',{'name':cur_obj.name},function(data){
					var remote_id = data.data;
					obj_list[obj.id]['remote_id']=remote_id;
					set_o(data_key,obj_list);
					try{
						upload_img(cur_obj.local_uri,remote_id,1,function(remote_uri){
							//toast('remote_uri:' + remote_uri);
							
							obj_list[obj.id]['remote_uri']=remote_uri;
							set_o(data_key,obj_list);
							
							list.shift();
							set_o(_this.key,list);
							_this.start();
							
						},function(){
							_this.hide_loading();
						})
					}catch(e){
						_this.hide_loading();
					}
				},function(){
					_this.hide_loading();
				})
				break;
			case 'edit':
				if( cur_obj.remote_id ){
					send_ajax(api_key+'.edit',{'id':cur_obj.remote_id,'values':{'name':cur_obj.name}},function(data){
						
						upload_img(cur_obj.local_uri,cur_obj.remote_id,1,function(remote_uri){
							set_o(data_key,obj_list);
							list.shift();
							set_o(_this.key,list);
							_this.start();
						},function(){
							_this.hide_loading();
						})		
						
					},function(){
						_this.hide_loading();
					})
				}else{
					list.shift();
					set_o(_this.key,list);
					_this.start();
				}
				break;
			case 'del':
				send_ajax(api_key+'.delete',{'id':obj.remote_id},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
		}
	}else{
		list.shift();
		set_o(_this.key,list);
		_this.start();
	}
};

/* 颜色 */
ALF_sync.prototype.sync_color = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	var page_key = 'color';
	var api_key = 'color';
	var data_key = 'my.settings.'+page_key;
	var obj_list = get_o(data_key);
	var cur_obj = obj_list[obj.id];
	
	if( cur_obj || obj.remote_id ){
		
		switch( obj.action ){
			case 'add':
				send_ajax(api_key+'.create',{'name':cur_obj.name},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
			case 'edit':
				if( cur_obj.remote_id ){
					send_ajax(api_key+'.edit',{'id':cur_obj.remote_id,'values':{'name':cur_obj.name}},function(data){
						list.shift();
						set_o(_this.key,list);
						_this.start();
					},function(){
						_this.hide_loading();
					})
				}else{
					list.shift();
					set_o(_this.key,list);
					_this.start();
				}
				break;
			case 'del':
				send_ajax(api_key+'.delete',{'id':obj.remote_id},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
		}
	}else{
		list.shift();
		set_o(_this.key,list);
		_this.start();
	}
};

/* 标签 */
ALF_sync.prototype.sync_tag = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	var page_key = 'tag';
	var api_key = 'tag';
	var data_key = 'my.settings.'+page_key;
	var obj_list = get_o(data_key);
	var cur_obj = obj_list[obj.id];
	
	if( cur_obj || obj.remote_id ){
		
		switch( obj.action ){
			case 'add':
				send_ajax(api_key+'.create',{'name':cur_obj.name},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
			case 'edit':
				if( cur_obj.remote_id ){
					send_ajax(api_key+'.edit',{'id':cur_obj.remote_id,'values':{'name':cur_obj.name}},function(data){
						list.shift();
						set_o(_this.key,list);
						_this.start();
					},function(){
						_this.hide_loading();
					})
				}else{
					list.shift();
					set_o(_this.key,list);
					_this.start();
				}
				break;
			case 'del':
				send_ajax(api_key+'.delete',{'id':obj.remote_id},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
		}
	}else{
		list.shift();
		set_o(_this.key,list);
		_this.start();
	}
};

/* 单品 */
ALF_sync.prototype.sync_single = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	var page_key = 'single';
	var api_key = 'single';
	var data_key = 'my.'+page_key;
	var obj_list = get_o(data_key);
	
	if( obj_list[obj.id] ){
		obj_list[obj.id]['is_download_1']=false;
		obj_list[obj.id]['is_download_2']=false;
		obj_list[obj.id]['is_download_3']=false;
		set_o(data_key,obj_list);
		var cur_obj = obj_list[obj.id];
	}
	
	if( cur_obj || obj.remote_id ){
		
		
		switch( obj.action ){
			case 'add':
				send_ajax(api_key+'.create',{
					'name':cur_obj.name,
					'description':JSON.stringify(cur_obj)
					},function(data){
					var remote_id = data.data;
					obj_list[obj.id]['remote_id']=remote_id;
					set_o(data_key,obj_list);
					
					//upload img 1
					if( cur_obj.local_uri_1 ){
						try{
							upload_img(cur_obj.local_uri_1,remote_id,1,function(remote_uri){
								//toast('remote_uri:' + remote_uri);
								
								obj_list[obj.id]['remote_uri_1']=remote_uri;
								set_o(data_key,obj_list);
								
								list.shift();
								set_o(_this.key,list);
								_this.start();
								
							},function(){
								_this.hide_loading();
							})
						}catch(e){
							_this.hide_loading();
						}
					}
					
					//upload img 2
					if( cur_obj.local_uri_2 ){
						try{
							upload_img(cur_obj.local_uri_2,remote_id,2,function(remote_uri){
								
								obj_list[obj.id]['remote_uri_2']=remote_uri;
								set_o(data_key,obj_list);
								
								list.shift();
								set_o(_this.key,list);
								_this.start();
								
							},function(){
								_this.hide_loading();
							})
						}catch(e){
							_this.hide_loading();
						}
					}
					
					//upload img 3
					if( cur_obj.local_uri_3 ){
						try{
							upload_img(cur_obj.local_uri_3,remote_id,3,function(remote_uri){
								//toast('remote_uri:' + remote_uri);
								
								obj_list[obj.id]['remote_uri_3']=remote_uri;
								set_o(data_key,obj_list);
								
								list.shift();
								set_o(_this.key,list);
								_this.start();
								
							},function(){
								_this.hide_loading();
							})
						}catch(e){
							_this.hide_loading();
						}
					}
					
				},function(){
					_this.hide_loading();
				})
				break;
			case 'edit':
				console.log("CASE EDIT SINGLE");
				console.log(cur_obj);
				if( cur_obj.remote_id ){
					send_ajax(api_key+'.edit',{
						'id':cur_obj.remote_id,
						'values':{
							'name':cur_obj.name,
							'description':JSON.stringify(cur_obj)
						}
					},function(data){
						
						var remote_id = cur_obj.remote_id;
						
						//upload img 1
						if( cur_obj.local_uri_1 ){
							try{
								upload_img(cur_obj.local_uri_1,cur_obj.remote_id,1,function(remote_uri){
									//toast('remote_uri:' + remote_uri);
									obj_list[obj.id]['remote_uri_1']=remote_uri;
									set_o(data_key,obj_list);
									
									list.shift();
									set_o(_this.key,list);
									_this.start();
									
								},function(){
									_this.hide_loading();
								})
							}catch(e){
								_this.hide_loading();
							}
						}
						
						//upload img 2
						if( cur_obj.local_uri_2 ){
							try{
								upload_img(cur_obj.local_uri_2,remote_id,2,function(remote_uri){
									//toast('remote_uri:' + remote_uri);
									
									toast('Upload 2 success ! remote_uri:' + remote_uri);
									
									obj_list[obj.id]['remote_uri_2']=remote_uri;
									set_o(data_key,obj_list);
									
									list.shift();
									set_o(_this.key,list);
									_this.start();
									
								},function(){
									_this.hide_loading();
								})
							}catch(e){
								_this.hide_loading();
							}
						}
						
						//upload img 3
						if( cur_obj.local_uri_3 ){
							try{
								upload_img(cur_obj.local_uri_3,remote_id,3,function(remote_uri){
									//toast('remote_uri:' + remote_uri);
									
									obj_list[obj.id]['remote_uri_3']=remote_uri;
									set_o(data_key,obj_list);
									
									list.shift();
									set_o(_this.key,list);
									_this.start();
									
								},function(){
									_this.hide_loading();
								})
							}catch(e){
								_this.hide_loading();
							}
						}
						
					},function(){
						_this.hide_loading();
					})
				}else{
					list.shift();
					set_o(_this.key,list);
					_this.start();
				}
				break;
			case 'del':
				send_ajax(api_key+'.delete',{'id':obj.remote_id},function(data){
					
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
		}
	}else{
		list.shift();
		set_o(_this.key,list);
		_this.start();
	}
};

/* 搭配 */
ALF_sync.prototype.sync_dapei = function( obj ){
	var _this = this;
	var list = get_o(_this.key);
	var page_key = 'dapei';
	var api_key = 'dapei';
	var data_key = 'my.'+page_key;
	var obj_list = get_o(data_key);
	var cur_obj = obj_list[obj.id];
	
	if( cur_obj || obj.remote_id ){
		
		switch( obj.action ){
			case 'add':
				send_ajax(api_key+'.create',{
					'name':cur_obj.name,
					'description':JSON.stringify(cur_obj)
					},function(data){
					var remote_id = data.data;
					obj_list[obj.id]['remote_id']=remote_id;
					set_o(data_key,obj_list);
					
					var single_list = obj_list[obj.id]['single_list'];
					
					for( var k in single_list ){
						var single_img_obj = single_list[k];
						
						console.log(single_img_obj);
						
						try{
							upload_img(single_img_obj.local_uri,obj_list[obj.id].remote_id,single_img_obj.cat,function(remote_uri){
								console.log('remote_uri:' + remote_uri);
								
								obj_list[obj.id]['remote_uri_3']=remote_uri;
								set_o(data_key,obj_list);
								
								list.shift();
								set_o(_this.key,list);
								_this.start();
								
							},function(){
								_this.hide_loading();
							})
						}catch(e){
							_this.hide_loading();
						}
					}



					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
			case 'edit':
				if( cur_obj.remote_id ){
					send_ajax(api_key+'.edit',{
						'id':cur_obj.remote_id,
						'values':{
							'name':cur_obj.name,
							'description':JSON.stringify(cur_obj)
						}
					},function(data){
						
						var single_list = obj_list[obj.id]['single_list'];
						
						for( var k in single_list ){
							var single_img_obj = single_list[k];
							
							console.log(single_img_obj);
							
							try{
								upload_img(single_img_obj.local_uri,obj_list[obj.id].remote_id,single_img_obj.cat,function(remote_uri){
									console.log('remote_uri:' + remote_uri);
									
									obj_list[obj.id]['remote_uri_3']=remote_uri;
									set_o(data_key,obj_list);
									
									list.shift();
									set_o(_this.key,list);
									_this.start();
									
								},function(){
									_this.hide_loading();
								})
							}catch(e){
								_this.hide_loading();
							}
						}
						
				
						list.shift();
						set_o(_this.key,list);
						_this.start();
					},function(){
						_this.hide_loading();
					})
				}else{
					list.shift();
					set_o(_this.key,list);
					_this.start();
				}
				break;
			case 'del':
				send_ajax(api_key+'.delete',{'id':obj.remote_id},function(data){
					list.shift();
					set_o(_this.key,list);
					_this.start();
				},function(){
					_this.hide_loading();
				})
				break;
		}
	}else{
		list.shift();
		set_o(_this.key,list);
		_this.start();
	}
};

