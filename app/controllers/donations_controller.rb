class DonationsController < ApplicationController
  def create 

    donations= Array.new
    if( params.has_key?('json') )
      @json = ActiveSupport::JSON.decode(params[:json])
      @json.each do |c|
        d = Donation.new( :event_id => params[:event_id],
                          :competitor_id => c['competitor_id'],
                          :choice => c['choice'] );
        if d.errors.any?
          render :json => d.errors, :status => 400
          return
        else
          donations.push(d)
        end    
      end
    else
      d = Donation.new( :event_id => params[:event_id],
                        :competitor_id => params[:competitor_id],
                        :choice => params[:choice] )
      if d.errors.any?
        return :json => d.errors, :status => 400 
      end
    end

    donations.each do |don|
      unless don.save
        render :json => don.errors, :status => 400
      end
    end 
    render :json => {}, :status => :ok
  end

  def confirm
  end

  def destroy
    @d = Donation.find(params[:id])
    @d.destroy
  end
end
